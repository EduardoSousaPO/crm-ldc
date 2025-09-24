import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema para criação de tentativas de contato
const ContactAttemptCreateSchema = z.object({
  lead_id: z.string().uuid('Lead ID inválido'),
  attempt_type: z.string().default('outbound'),
  contact_method: z.enum(['phone', 'email', 'whatsapp', 'linkedin', 'in_person', 'video_call', 'sms']),
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
  ]),
  scheduled_date: z.string().datetime().optional(),
  completed_date: z.string().datetime().optional(),
  duration_minutes: z.number().positive().optional(),
  notes: z.string().optional(),
  next_action: z.string().optional(),
  next_contact_date: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  template_used: z.string().uuid().optional(),
  outcome_summary: z.string().optional()
})

const ContactAttemptUpdateSchema = ContactAttemptCreateSchema.partial()

// GET /api/contact-attempts - Listar tentativas de contato
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('lead_id')
    const status = searchParams.get('status')
    const contactMethod = searchParams.get('contact_method')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('contact_attempts')
      .select(`
        *,
        lead:leads!contact_attempts_lead_id_fkey(id, name, email, phone),
        user:users!contact_attempts_user_id_fkey(id, name, email),
        template:follow_up_templates(id, name, template_content)
      `)

    // Aplicar RLS - consultores só veem suas tentativas
    if ((userProfile as any)?.role !== 'admin') {
      query = query.eq('user_id', user.id)
    }

    // Filtros
    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (contactMethod) {
      query = query.eq('contact_method', contactMethod)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    // Paginação e ordenação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: contactAttempts, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: contactAttempts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error: any) {
    console.error('Erro ao listar tentativas de contato:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contact-attempts - Criar nova tentativa de contato
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar dados
    const validatedData = ContactAttemptCreateSchema.parse(body)

    // Verificar se o lead existe e se o usuário tem acesso
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', validatedData.lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
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

    // Verificar permissão (consultores só podem criar para seus leads)
    if ((userProfile as any)?.role !== 'admin' && (lead as any).consultant_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Criar tentativa de contato
    const { data: contactAttempt, error } = await (supabase as any)
      .from('contact_attempts')
      .insert({
        ...validatedData,
        user_id: user.id
      })
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

    // Atualizar campos de tracking no lead
    const updateData: any = {
      last_contact_attempt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (validatedData.next_contact_date) {
      updateData.next_follow_up_date = validatedData.next_contact_date
    }

    await (supabase as any)
      .from('leads')
      .update(updateData)
      .eq('id', validatedData.lead_id)

    return NextResponse.json({
      success: true,
      data: contactAttempt,
      message: 'Tentativa de contato registrada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao criar tentativa de contato:', error)
    
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
