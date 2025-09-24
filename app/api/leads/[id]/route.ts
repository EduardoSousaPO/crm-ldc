import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema de validação para atualização
const LeadUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').nullable().optional(),
  phone: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['lead_qualificado', 'reuniao_agendada', 'proposta_apresentada', 'cliente_ativo']).optional(),
  consultant_id: z.string().uuid('ID do consultor inválido').optional(),
  score: z.number().min(0).max(100).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/leads/[id] - Buscar lead específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Await params no Next.js 15
    const { id: leadId } = await params

    if (!leadId) {
      return NextResponse.json({ error: 'ID do lead é obrigatório' }, { status: 400 })
    }

    // Buscar perfil do usuário para verificar permissões
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Construir query
    let query = supabase
      .from('leads')
      .select(`
        *,
        consultant:users!consultant_id(id, name, email),
        interactions(*),
        tasks(*),
        meetings(*)
      `)
      .eq('id', leadId)

    // Aplicar filtro de permissão se não for admin
    if ((userProfile as any)?.role !== 'admin') {
      query = query.eq('consultant_id', user.id)
    }

    const { data: lead, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
      }
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: lead
    })

  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[id] - Atualizar lead
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Await params no Next.js 15
    const { id: leadId } = await params
    const body = await request.json()

    if (!leadId) {
      return NextResponse.json({ error: 'ID do lead é obrigatório' }, { status: 400 })
    }

    // Validar dados
    const validatedData = LeadUpdateSchema.parse(body)

    // Buscar perfil do usuário para verificar permissões
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Verificar se o lead existe e se o usuário tem permissão
    let leadQuery = supabase
      .from('leads')
      .select('id, consultant_id')
      .eq('id', leadId)

    if ((userProfile as any)?.role !== 'admin') {
      leadQuery = leadQuery.eq('consultant_id', user.id)
    }

    const { data: existingLead, error: leadError } = await leadQuery.single()

    if (leadError || !existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Verificar duplicata de email se estiver sendo atualizado
    if (validatedData.email) {
      const { data: duplicateLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', leadId)
        .single()

      if (duplicateLead) {
        return NextResponse.json(
          { error: 'Já existe outro lead com este email' },
          { status: 409 }
        )
      }
    }

    // Atualizar lead
    const { data: updatedLead, error } = await (supabase as any)
      .from('leads')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select(`
        *,
        consultant:users!consultant_id(id, name, email)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead atualizado com sucesso'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Excluir lead
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Await params no Next.js 15
    const { id: leadId } = await params

    if (!leadId) {
      return NextResponse.json({ error: 'ID do lead é obrigatório' }, { status: 400 })
    }

    // Buscar perfil do usuário para verificar permissões
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Verificar se o lead existe e se o usuário tem permissão
    let leadQuery = supabase
      .from('leads')
      .select('id, name')
      .eq('id', leadId)

    if ((userProfile as any)?.role !== 'admin') {
      leadQuery = leadQuery.eq('consultant_id', user.id)
    }

    const { data: existingLead, error: leadError } = await leadQuery.single() as { data: { id: string, name: string } | null, error: any }

    if (leadError || !existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Excluir lead (CASCADE irá excluir relacionamentos)
    const { error } = await (supabase as any)
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: `Lead "${existingLead.name}" excluído com sucesso`
    })

  } catch (error) {
    console.error('Erro ao excluir lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
