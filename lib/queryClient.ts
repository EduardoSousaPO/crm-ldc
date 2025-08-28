import { QueryClient } from '@tanstack/react-query'

// Configuração otimizada do React Query para CRM
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos para dados do CRM
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry apenas 1 vez em caso de erro
      retry: 1,
      // Refetch quando a janela recebe foco (útil para CRM)
      refetchOnWindowFocus: true,
      // Não refetch automaticamente quando reconecta
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutações apenas 1 vez
      retry: 1,
    },
  },
})

// Query keys para organização
export const queryKeys = {
  // Usuários
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userProfile: ['user', 'profile'] as const,
  
  // Leads
  leads: ['leads'] as const,
  lead: (id: string) => ['leads', id] as const,
  leadsByStatus: (status: string) => ['leads', 'status', status] as const,
  leadsByUser: (userId: string) => ['leads', 'user', userId] as const,
  
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardKpis: (userId?: string) => ['dashboard', 'kpis', userId] as const,
  
  // Interações
  interactions: (leadId: string) => ['interactions', leadId] as const,
  
  // Tarefas
  tasks: ['tasks'] as const,
  tasksByUser: (userId: string) => ['tasks', 'user', userId] as const,
  tasksByLead: (leadId: string) => ['tasks', 'lead', leadId] as const,
  
  // Reuniões
  meetings: ['meetings'] as const,
  meetingsByUser: (userId: string) => ['meetings', 'user', userId] as const,
} as const

