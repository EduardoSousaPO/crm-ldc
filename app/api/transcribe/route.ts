import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createSupabaseServiceClient } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const leadId = formData.get('leadId') as string
    const userId = formData.get('userId') as string

    if (!audioFile || !leadId || !userId) {
      return NextResponse.json(
        { error: 'Audio file, leadId and userId are required' },
        { status: 400 }
      )
    }

    // Verificar se o arquivo é válido
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid audio file format' },
        { status: 400 }
      )
    }

    // Transcrever áudio com Whisper
    console.log('Transcrevendo áudio com Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0.0,
    })

    const transcribedText = transcription.text

    // Processar transcrição com GPT para extrair informações
    console.log('Processando transcrição com GPT...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em consultoria de investimentos CVM. 
          Analise a transcrição de uma conversa com um lead e extraia:
          
          1. RESUMO: Um resumo conciso da conversa (máximo 200 caracteres)
          2. PRÓXIMAS_AÇÕES: Lista de ações específicas a serem tomadas
          3. INFORMAÇÕES_IMPORTANTES: Dados relevantes sobre o lead (perfil, objetivos, etc.)
          4. SENTIMENTO: Classificação do interesse do lead (Alto/Médio/Baixo)
          5. PRÓXIMO_CONTATO: Sugestão de quando fazer o próximo contato
          
          Responda APENAS em JSON válido com essas chaves.`
        },
        {
          role: 'user',
          content: `Transcrição da conversa: "${transcribedText}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    let aiAnalysis
    try {
      aiAnalysis = JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Erro ao fazer parse da resposta da IA:', error)
      aiAnalysis = {
        RESUMO: 'Análise não disponível',
        PRÓXIMAS_AÇÕES: [],
        INFORMAÇÕES_IMPORTANTES: [],
        SENTIMENTO: 'Médio',
        PRÓXIMO_CONTATO: 'Em 3 dias'
      }
    }

    // Salvar no Supabase
    const supabase = createSupabaseServiceClient()
    
    const { data: interaction, error: interactionError } = await supabase
      .from('interactions')
      .insert({
        lead_id: leadId,
        type: 'audio',
        content: `Áudio gravado - ${new Date().toLocaleString('pt-BR')}`,
        transcription: transcribedText,
        ai_summary: JSON.stringify(aiAnalysis),
      })
      .select()
      .single()

    if (interactionError) {
      console.error('Erro ao salvar interação:', interactionError)
      return NextResponse.json(
        { error: 'Failed to save interaction' },
        { status: 500 }
      )
    }

    // Criar tarefas automáticas baseadas nas próximas ações
    if (aiAnalysis.PRÓXIMAS_AÇÕES && Array.isArray(aiAnalysis.PRÓXIMAS_AÇÕES)) {
      const tasksToCreate = aiAnalysis.PRÓXIMAS_AÇÕES.map((action: string) => ({
        lead_id: leadId,
        title: action,
        description: `Tarefa gerada automaticamente pela IA baseada na conversa de ${new Date().toLocaleDateString('pt-BR')}`,
        assigned_to: userId,
        created_by: userId,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        status: 'pending'
      }))

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToCreate)

      if (tasksError) {
        console.error('Erro ao criar tarefas:', tasksError)
      }
    }

    // Atualizar score do lead baseado no sentimento
    let scoreIncrement = 0
    switch (aiAnalysis.SENTIMENTO?.toLowerCase()) {
      case 'alto':
        scoreIncrement = 20
        break
      case 'médio':
        scoreIncrement = 10
        break
      case 'baixo':
        scoreIncrement = 0
        break
      default:
        scoreIncrement = 5
    }

    if (scoreIncrement > 0) {
      await (supabase as any).rpc('increment_lead_score', {
        lead_id: leadId,
        increment: scoreIncrement
      })
    }

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      analysis: aiAnalysis,
      interactionId: interaction.id,
    })

  } catch (error) {
    console.error('Erro na transcrição:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
