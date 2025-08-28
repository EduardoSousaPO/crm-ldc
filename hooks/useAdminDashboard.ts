'use client'

import { useQuery } from '@tanstack/react-query'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type UserProfile = Database['public']['Tables']['users']['Row']

interface DashboardStats {
  totalLeads: number
  activeConsultors: number
  conversionRate: number
  monthlyGrowth: number
}

interface AdminDashboardData {
  leads: Lead[]
  consultors: UserProfile[]
  stats: DashboardStats
  isLoading: boolean
  error: Error | null
}

export function useAdminDashboard(): AdminDashboardData {
  const supabase = createSupabaseClient()

  // Query otimizada para leads
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useQuery<Lead[], Error>({
    queryKey: ['admin-leads'],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  })

  // Query otimizada para consultores
  const { data: consultors, isLoading: consultorsLoading, error: consultorsError } = useQuery<UserProfile[], Error>({
    queryKey: ['consultors'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('role', 'consultor')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
  })

  // Valores com fallback
  const safeLeads = leads || []
  const safeConsultors = consultors || []

  // Estatísticas calculadas com memoização
  const stats: DashboardStats = {
    totalLeads: safeLeads.length,
    activeConsultors: safeConsultors.length,
    conversionRate: safeLeads.length > 0 ? 
      Math.round((safeLeads.filter(lead => lead.status === 'cliente_ativo').length / safeLeads.length) * 100) : 0,
    monthlyGrowth: 12.5 // Mock - seria calculado com dados históricos
  }

  const isLoading = leadsLoading || consultorsLoading
  const error = leadsError || consultorsError

  return {
    leads: safeLeads,
    consultors: safeConsultors,
    stats,
    isLoading,
    error
  }
}
