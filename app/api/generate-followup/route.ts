import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createSupabaseServiceClient } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export async function POST(request: NextRequest) {
  try {
    const { leadId, userId, context, type = 'email' } = await request.json()

    if (!leadId || !userId) {
      return NextResponse.json(
        { error: 'LeadId and userId are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Buscar dados do lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Buscar interações recentes
    const { data: interactions } = await supabase
      .from('interactions')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(3)

    // Buscar tarefas pendentes
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    // Construir contexto para a IA
    const leadContext = `
    INFORMAÇÕES DO LEAD:
    - Nome: ${lead.name}
    - Status atual: ${lead.status}
    - Score: ${lead.score || 0}
    - Origem: ${lead.origin || 'Não informado'}
    - Notas: ${lead.notes || 'Nenhuma nota'}
    
    INTERAÇÕES RECENTES:
    ${interactions?.map(i => `
    - ${i.type}: ${i.content}
    ${i.ai_summary ? `Análise IA: ${i.ai_summary}` : ''}
    `).join('\n') || 'Nenhuma interação'}
    
    TAREFAS PENDENTES:
    ${tasks?.map(t => `- ${t.title}: ${t.description || ''}`).join('\n') || 'Nenhuma tarefa'}
    
    CONTEXTO ADICIONAL: ${context || 'Não fornecido'}
    `

    // Gerar follow-up com GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em consultoria de investimentos CVM.
          
          Gere um follow-up ${type === 'email' ? 'por email' : 'via WhatsApp'} profissional e personalizado.
          
          DIRETRIZES:
          - Tom profissional mas acessível
          - Personalize com base no histórico do lead
          - Inclua próximos passos claros
          - Mantenha o foco em valor para o cliente
          - ${type === 'email' ? 'Inclua assunto e corpo do email' : 'Mensagem direta e objetiva'}
          - Use linguagem adequada ao perfil do investidor
          
          ESTRUTURA DE RESPOSTA:
          ${type === 'email' ? `
          {
            "assunto": "Assunto do email",
            "corpo": "Corpo do email em HTML simples",
            "tipo": "email"
          }` : `
          {
            "mensagem": "Mensagem para WhatsApp",
            "tipo": "whatsapp"
          }`}
          
          Responda APENAS em JSON válido.`
        },
        {
          role: 'user',
          content: leadContext
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    let followUpContent
    try {
      followUpContent = JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Erro ao fazer parse da resposta da IA:', error)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Salvar como interação
    const { data: interaction, error: interactionError } = await supabase
      .from('interactions')
      .insert({
        lead_id: leadId,
        type: 'note',
        content: `Follow-up ${type} gerado por IA - ${new Date().toLocaleString('pt-BR')}`,
        ai_summary: JSON.stringify(followUpContent),
      })
      .select()
      .single()

    if (interactionError) {
      console.error('Erro ao salvar interação:', interactionError)
    }

    return NextResponse.json({
      success: true,
      followUp: followUpContent,
      interactionId: interaction?.id,
    })

  } catch (error) {
    console.error('Erro na geração de follow-up:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
