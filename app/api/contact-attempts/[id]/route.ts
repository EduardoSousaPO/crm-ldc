import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Schema para atualização
const ContactAttemptUpdateSchema = z.object({
  attempt_type: z.string().optional(),
  contact_method: z.enum(['phone', 'email', 'whatsapp', 'linkedin', 'in_person', 'video_call', 'sms']).optional(),
  status: z.enum([
    'not_answered',
    'requested_callback', 
    'meeting_scheduled',
    'not_interested',
    'converted',
    'invalid_contact',
    'busy_try_later',
    'voicemail_left',
    'email_sent',
    'follow_up_scheduled'
  ]).optional(),
  scheduled_date: z.string().datetime().optional().nullable(),
  completed_date: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  next_contact_date: z.string().datetime().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  template_used: z.string().uuid().optional().nullable(),
  outcome_summary: z.string().optional().nullable()
})

// GET /api/contact-attempts/[id] - Buscar tentativa específica
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

    const { id: contactAttemptId } = await params

    // Buscar tentativa de contato
    const { data: contactAttempt, error } = await supabase
      .from('contact_attempts')
      .select(`
        *,
        lead:leads!contact_attempts_lead_id_fkey(id, name, email, phone),
        user:users!contact_attempts_user_id_fkey(id, name, email),
        template:follow_up_templates(id, name, template_content)
      `)
      .eq('id', contactAttemptId)
      .single()

    if (error || !contactAttempt) {
      return NextResponse.json({ error: 'Tentativa de contato não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contactAttempt
    })

  } catch (error) {
    console.error('Erro ao buscar tentativa de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/contact-attempts/[id] - Atualizar tentativa de contato
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

    const { id: contactAttemptId } = await params
    const body = await request.json()
    
    // Validar dados
    const validatedData = ContactAttemptUpdateSchema.parse(body)

    // Buscar tentativa existente
    const { data: existingAttempt, error: attemptError } = await supabase
      .from('contact_attempts')
      .select('*')
      .eq('id', contactAttemptId)
      .single()

    if (attemptError || !existingAttempt) {
      return NextResponse.json({ error: 'Tentativa de contato não encontrada' }, { status: 404 })
    }

    // Buscar perfil do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar permissão (consultores só podem editar suas tentativas)
    if ((userProfile as any)?.role !== 'admin' && (existingAttempt as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Atualizar tentativa de contato
    const { data: updatedAttempt, error } = await (supabase as any)
      .from('contact_attempts')
      .update(validatedData)
      .eq('id', contactAttemptId)
      .select(`
        *,
        lead:leads!contact_attempts_lead_id_fkey(id, name, email, phone),
        user:users!contact_attempts_user_id_fkey(id, name, email),
        template:follow_up_templates(id, name, template_content)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Atualizar próximo follow-up no lead se fornecido
    if (validatedData.next_contact_date !== undefined) {
      await (supabase as any)
        .from('leads')
        .update({ 
          next_follow_up_date: validatedData.next_contact_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', (existingAttempt as any).lead_id)
    }

    return NextResponse.json({
      success: true,
      data: updatedAttempt,
      message: 'Tentativa de contato atualizada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao atualizar tentativa de contato:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/contact-attempts/[id] - Excluir tentativa de contato
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

    const { id: contactAttemptId } = await params

    // Buscar tentativa existente
    const { data: existingAttempt, error: attemptError } = await supabase
      .from('contact_attempts')
      .select('*')
      .eq('id', contactAttemptId)
      .single()

    if (attemptError || !existingAttempt) {
      return NextResponse.json({ error: 'Tentativa de contato não encontrada' }, { status: 404 })
    }

    // Buscar perfil do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar permissão (consultores só podem excluir suas tentativas)
    if ((userProfile as any)?.role !== 'admin' && (existingAttempt as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Excluir tentativa de contato
    const { error } = await supabase
      .from('contact_attempts')
      .delete()
      .eq('id', contactAttemptId)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Tentativa de contato excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir tentativa de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
