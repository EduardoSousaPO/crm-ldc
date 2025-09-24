import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Schema base para leads
const LeadBaseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  consultant_id: z.string().uuid('ID do consultor inválido').optional(),
  score: z.number().min(0).max(100).optional().default(0),
})

// Schema para criação com validação
const LeadCreateSchema = LeadBaseSchema.refine(
  (data) => data.email || data.phone,
  {
    message: "Email ou telefone é obrigatório",
    path: ["email"],
  }
)

// Schema para atualização (todos os campos opcionais)
const LeadUpdateSchema = LeadBaseSchema.partial()

// GET /api/leads - Listar leads com filtros
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
    const status = searchParams.get('status')
    const consultorId = searchParams.get('consultant_id')
    const origin = searchParams.get('origin')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query base
    let query = supabase
      .from('leads')
      .select(`
        *,
        consultant:users!consultant_id(id, name, email),
        interactions(id, type, created_at),
        tasks(id, title, status, due_date)
      `)

    // Aplicar filtros baseados no papel do usuário
    if ((userProfile as any).role !== 'admin') {
      query = query.eq('consultant_id', user.id)
    }

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }

    if (consultorId && (userProfile as any).role === 'admin') {
      query = query.eq('consultant_id', consultorId)
    }

    if (origin) {
      query = query.eq('origin', origin)
    }

    // Paginação e ordenação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: leads, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      data: leads || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Erro ao listar leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Criar novo lead
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
    const validatedData = LeadCreateSchema.parse(body)

    // Verificar duplicatas por email
    if (validatedData.email) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', validatedData.email)
        .single()

      if (existingLead) {
        return NextResponse.json(
          { error: 'Lead com este email já existe' },
          { status: 409 }
        )
      }
    }

    // Criar lead
    const { data: newLead, error } = await (supabase as any)
      .from('leads')
      .insert({
        ...validatedData,
        consultant_id: validatedData.consultant_id || user.id,
        status: 'lead_qualificado'
      })
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
      data: newLead,
      message: 'Lead criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
