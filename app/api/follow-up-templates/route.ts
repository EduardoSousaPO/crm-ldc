import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema para templates
const TemplateCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  contact_method: z.enum(['phone', 'email', 'whatsapp', 'linkedin', 'in_person', 'video_call', 'sms']),
  template_content: z.string().min(1, 'Conteúdo do template é obrigatório'),
  suggested_timing_days: z.number().min(0).default(1),
  is_active: z.boolean().default(true)
})

const TemplateUpdateSchema = TemplateCreateSchema.partial()

// GET /api/follow-up-templates - Listar templates
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contactMethod = searchParams.get('contact_method')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('follow_up_templates')
      .select(`
        *,
        created_by_user:users!follow_up_templates_created_by_fkey(id, name, email)
      `)

    // Filtros
    if (contactMethod) {
      query = query.eq('contact_method', contactMethod)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Ordenação
    query = query.order('name', { ascending: true })

    const { data: templates, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: templates || []
    })

  } catch (error) {
    console.error('Erro ao listar templates:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/follow-up-templates - Criar template
export async function POST(request: NextRequest) {
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

    // Verificar se é admin (apenas admins podem criar templates)
    if ((userProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - apenas administradores podem criar templates' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validar dados
    const validatedData = TemplateCreateSchema.parse(body)

    // Criar template
    const { data: template, error } = await (supabase as any)
      .from('follow_up_templates')
      .insert({
        ...validatedData,
        created_by: user.id
      })
      .select(`
        *,
        created_by_user:users!follow_up_templates_created_by_fkey(id, name, email)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template criado com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao criar template:', error)
    
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
