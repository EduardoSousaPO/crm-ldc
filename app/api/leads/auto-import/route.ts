import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

interface AutoImportLeadData {
  name: string
  email?: string
  phone?: string
  origin: string
  score?: number
  notes?: string
  consultant_id?: string
  // Dados específicos da qualificação IA
  qualification_data?: {
    source: 'n8n' | 'waha' | 'google_sheets'
    ai_score: number
    qualification_notes: string
    contact_preference?: 'whatsapp' | 'email' | 'phone'
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    
    // Verificar autenticação da API (header de segurança)
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.CRM_API_KEY
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    const body: AutoImportLeadData | AutoImportLeadData[] = await request.json()
    
    // Suporta tanto lead único quanto array de leads
    const leadsToImport = Array.isArray(body) ? body : [body]
    
    const results = []
    
    for (const leadData of leadsToImport) {
      // Validação básica
      if (!leadData.name) {
        results.push({
          success: false,
          error: 'Nome é obrigatório',
          data: leadData
        })
        continue
      }

      // Verificar se lead já existe (por email ou telefone)
      let existingLead: any = null
      if (leadData.email) {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .eq('email', leadData.email)
          .single()
        existingLead = data
      }
      
      if (!existingLead && leadData.phone) {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .eq('phone', leadData.phone)
          .single()
        existingLead = data
      }

      if (existingLead) {
        // Lead já existe - atualizar dados se necessário
        const updateData: any = {
          updated_at: new Date().toISOString()
        }
        
        // Atualizar score se o novo for maior
        if (leadData.score && leadData.score > (existingLead.score || 0)) {
          updateData.score = leadData.score
        }
        
        // Adicionar notas de qualificação
        if (leadData.qualification_data?.qualification_notes) {
          const existingNotes = existingLead.notes || ''
          updateData.notes = existingNotes + 
            `\n\n[${new Date().toLocaleString('pt-BR')}] Requalificação IA: ${leadData.qualification_data.qualification_notes}`
        }

        const { error } = await (supabase as any)
          .from('leads')
          .update(updateData)
          .eq('id', existingLead.id)

        if (error) {
          results.push({
            success: false,
            error: error.message,
            data: leadData
          })
        } else {
          results.push({
            success: true,
            action: 'updated',
            leadId: existingLead.id,
            data: leadData
          })
        }
        continue
      }

      // Determinar consultor responsável
      let consultantId = leadData.consultant_id
      
      if (!consultantId) {
        // Buscar consultor disponível (distribuição automática)
        const { data: consultors } = await supabase
          .from('users')
          .select('id, name')
          .in('role', ['consultant', 'consultor'])
          .order('created_at', { ascending: true })
          .limit(1)

        if (consultors && consultors.length > 0) {
          consultantId = (consultors as any)[0].id
        }
      }

      if (!consultantId) {
        results.push({
          success: false,
          error: 'Nenhum consultor disponível para atribuição',
          data: leadData
        })
        continue
      }

      // Criar novo lead
      const newLeadData: any = {
        name: leadData.name,
        email: leadData.email || null,
        phone: leadData.phone || null,
        origin: leadData.origin || 'Qualificação IA',
        status: 'lead_qualificado', // Sempre entra na primeira fase
        consultant_id: consultantId,
        score: leadData.score || leadData.qualification_data?.ai_score || 50,
        notes: leadData.notes || 
          (leadData.qualification_data ? 
            `Qualificado automaticamente via ${leadData.qualification_data.source}\nScore IA: ${leadData.qualification_data.ai_score}\nNotas: ${leadData.qualification_data.qualification_notes}` 
            : null)
      }

      const { data: createdLead, error } = await (supabase as any)
        .from('leads')
        .insert(newLeadData)
        .select()
        .single()

      if (error) {
        results.push({
          success: false,
          error: error.message,
          data: leadData
        })
      } else {

        // Criar tarefa automática para primeiro contato (mantida por compatibilidade)
        const taskData: any = {
          lead_id: createdLead.id,
          title: `Primeiro contato - ${leadData.name}`,
          description: `Lead qualificado automaticamente. Fazer contato inicial em até 24h.\n${leadData.qualification_data?.contact_preference ? `Preferência: ${leadData.qualification_data.contact_preference}` : ''}`,
          assigned_to: consultantId,
          created_by: consultantId,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          status: 'pending'
        }
        
        await (supabase as any)
          .from('tasks')
          .insert(taskData)

        results.push({
          success: true,
          action: 'created',
          leadId: createdLead.id,
          data: leadData
        })
      }
    }

    // Estatísticas do resultado
    const stats = {
      total: results.length,
      created: results.filter(r => r.success && r.action === 'created').length,
      updated: results.filter(r => r.success && r.action === 'updated').length,
      failed: results.filter(r => !r.success).length
    }

    return NextResponse.json({
      success: true,
      message: `Processados ${stats.total} leads: ${stats.created} criados, ${stats.updated} atualizados, ${stats.failed} falharam`,
      stats,
      results
    })

  } catch (error) {
    console.error('Erro no auto-import de leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Endpoint GET para testar conectividade
export async function GET() {
  return NextResponse.json({
    message: 'CRM Auto-Import API ativa',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: '/api/leads/auto-import - Importar leads qualificados',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY'
      },
      example: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '+5511999999999',
        origin: 'WhatsApp Bot',
        qualification_data: {
          source: 'waha',
          ai_score: 85,
          qualification_notes: 'Interessado em renda fixa, patrimônio ~100k',
          contact_preference: 'whatsapp'
        }
      }
    }
  })
}
