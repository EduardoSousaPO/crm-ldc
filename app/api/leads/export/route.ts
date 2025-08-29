import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

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
    const { 
      filters = {}, 
      includeInteractions = false,
      includeTasks = false,
      columns = ['name', 'email', 'phone', 'origin', 'status', 'score', 'created_at']
    } = body

    // Construir query base
    let query = supabase
      .from('leads')
      .select(`
        *,
        consultant:users!consultant_id(name),
        ${includeInteractions ? 'interactions(*),' : ''}
        ${includeTasks ? 'tasks(*)' : ''}
      `)

    // Aplicar filtros baseados no papel do usuário
    if (userProfile.role !== 'admin') {
      query = query.eq('consultant_id', user.id)
    }

    // Aplicar filtros adicionais
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters.consultorId && userProfile.role === 'admin') {
      query = query.eq('consultant_id', filters.consultorId)
    }

    if (filters.origin && filters.origin.length > 0) {
      query = query.in('origin', filters.origin)
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    if (filters.minScore !== undefined) {
      query = query.gte('score', filters.minScore)
    }

    if (filters.maxScore !== undefined) {
      query = query.lte('score', filters.maxScore)
    }

    // Ordenar por data de criação
    query = query.order('created_at', { ascending: false })

    // Executar query
    const { data: leads, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Processar dados para exportação
    const processedData = leads?.map(lead => {
      const baseData: any = {}

      // Incluir apenas colunas selecionadas
      columns.forEach(column => {
        switch (column) {
          case 'name':
            baseData['Nome'] = lead.name
            break
          case 'email':
            baseData['Email'] = lead.email || ''
            break
          case 'phone':
            baseData['Telefone'] = lead.phone || ''
            break
          case 'origin':
            baseData['Origem'] = lead.origin || ''
            break
          case 'status':
            baseData['Status'] = lead.status
            break
          case 'score':
            baseData['Score'] = lead.score || 0
            break
          case 'consultant':
            baseData['Consultor'] = lead.consultant?.name || ''
            break
          case 'notes':
            baseData['Observações'] = lead.notes || ''
            break
          case 'created_at':
            baseData['Data de Criação'] = new Date(lead.created_at).toLocaleDateString('pt-BR')
            break
          case 'updated_at':
            baseData['Última Atualização'] = new Date(lead.updated_at).toLocaleDateString('pt-BR')
            break
        }
      })

      // Adicionar dados relacionados se solicitado
      if (includeInteractions && lead.interactions) {
        baseData['Total de Interações'] = lead.interactions.length
        baseData['Última Interação'] = lead.interactions.length > 0 
          ? new Date(lead.interactions[0].created_at).toLocaleDateString('pt-BR')
          : ''
      }

      if (includeTasks && lead.tasks) {
        baseData['Total de Tarefas'] = lead.tasks.length
        baseData['Tarefas Pendentes'] = lead.tasks.filter((task: any) => task.status === 'pending').length
      }

      return baseData
    }) || []

    return NextResponse.json({
      success: true,
      data: processedData,
      total: processedData.length,
      filters: filters
    })

  } catch (error) {
    console.error('Erro na exportação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
