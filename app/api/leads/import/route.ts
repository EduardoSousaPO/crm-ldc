import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { z } from 'zod'

// Schema de validação para leads
const LeadSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => data.email || data.phone,
  {
    message: "Email ou telefone é obrigatório",
    path: ["email"],
  }
)

interface ImportResult {
  success: boolean
  imported: number
  errors: Array<{
    row: number
    data: any
    error: string
  }>
  duplicates: Array<{
    row: number
    email: string
    existingId: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { leads, consultorId, distributeEvenly } = body

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'Lista de leads inválida' }, { status: 400 })
    }

    if (leads.length > 1000) {
      return NextResponse.json({ error: 'Máximo de 1000 leads por importação' }, { status: 400 })
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      duplicates: []
    }

    // Buscar consultores disponíveis se for distribuição automática
    let consultors: any[] = []
    if (distributeEvenly && userProfile.role === 'admin') {
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'consultor')
      consultors = data || []
    }

    // Buscar emails existentes para detectar duplicatas
    const emails = leads
      .map(lead => lead.email)
      .filter(email => email && email.trim())
    
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id, email')
      .in('email', emails)

    const existingEmails = new Set(existingLeads?.map(lead => lead.email) || [])

    // Processar cada lead
    for (let i = 0; i < leads.length; i++) {
      const leadData = leads[i]
      
      try {
        // Validar dados
        const validatedLead = LeadSchema.parse(leadData)

        // Verificar duplicata
        if (validatedLead.email && existingEmails.has(validatedLead.email)) {
          const existingLead = existingLeads?.find(l => l.email === validatedLead.email)
          result.duplicates.push({
            row: i + 1,
            email: validatedLead.email,
            existingId: existingLead?.id || ''
          })
          continue
        }

        // Determinar consultor responsável
        let assignedConsultorId = consultorId || userProfile.id

        if (distributeEvenly && consultors.length > 0) {
          assignedConsultorId = consultors[result.imported % consultors.length].id
        }

        // Inserir lead
        const { error: insertError } = await supabase
          .from('leads')
          .insert({
            name: validatedLead.name,
            email: validatedLead.email,
            phone: validatedLead.phone,
            origin: validatedLead.origin || 'importacao',
            notes: validatedLead.notes,
            status: 'lead_qualification',
            consultant_id: assignedConsultorId,
            score: 0
          })

        if (insertError) {
          throw new Error(insertError.message)
        }

        result.imported++

      } catch (error) {
        result.errors.push({
          row: i + 1,
          data: leadData,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na importação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
