'use client'

import { useQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

interface ConsultorStats {
  totalLeads: number
  activeLeads: number
  conversionRate: number
  pendingTasks: number
}

interface ConsultorDashboardData {
  leads: Lead[]
  tasks: Task[]
  stats: ConsultorStats
  isLoading: boolean
  error: Error | null
}

export function useConsultorDashboard(consultorId: string): ConsultorDashboardData {
  const supabase = createSupabaseClient()

  // Query otimizada para leads do consultor
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useQuery<Lead[], Error>({
    queryKey: ['consultor-leads', consultorId],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .eq('consultant_id', consultorId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: !!consultorId,
  })

  // Query otimizada para tarefas do consultor
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery<Task[], Error>({
    queryKey: ['consultor-tasks', consultorId],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('assigned_to', consultorId)
        .order('due_date', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: !!consultorId,
  })

  // Valores com fallback
  const safeLeads = leads || []
  const safeTasks = tasks || []

  // Estatísticas calculadas com memoização
  const stats: ConsultorStats = {
    totalLeads: safeLeads.length,
    activeLeads: safeLeads.filter(lead => 
      ['lead_qualificado', 'contato_inicial', 'reuniao_agendada', 'discovery_concluido', 'proposta_apresentada', 'em_negociacao'].includes(lead.status || 'lead_qualificado')
    ).length,
    conversionRate: safeLeads.length > 0 ? 
      Math.round((safeLeads.filter(lead => lead.status === 'cliente_ativo').length / safeLeads.length) * 100) : 0,
    pendingTasks: safeTasks.filter(task => task.status === 'pending').length
  }

  const isLoading = leadsLoading || tasksLoading
  const error = leadsError || tasksError

  return {
    leads: safeLeads,
    tasks: safeTasks,
    stats,
    isLoading,
    error
  }
}
