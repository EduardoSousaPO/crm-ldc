'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadWithRelations extends Lead {
  consultant?: {
    id: string
    name: string
    email: string
  }
  interactions?: any[]
  tasks?: any[]
  meetings?: any[]
}

interface CreateLeadData {
  name: string
  email?: string | null
  phone?: string | null
  origin?: string | null
  notes?: string | null
  consultant_id?: string
  score?: number
}

interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: 'lead_qualificado' | 'reuniao_agendada' | 'proposta_apresentada' | 'cliente_ativo'
}

interface LeadFilters {
  status?: string
  consultant_id?: string
  origin?: string
  limit?: number
  offset?: number
}

// Hook para listar leads
export function useLeads(filters: LeadFilters = {}) {
  return useQuery<LeadWithRelations[]>({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.consultant_id) params.append('consultant_id', filters.consultant_id)
      if (filters.origin) params.append('origin', filters.origin)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/leads?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar leads')
      }

      const result = await response.json()
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar um lead específico
export function useLead(leadId: string, enabled = true) {
  return useQuery<LeadWithRelations>({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${leadId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar lead')
      }

      const result = await response.json()
      return result.data
    },
    enabled: enabled && !!leadId,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
  })
}

// Hook para criar lead
export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation<LeadWithRelations, Error, CreateLeadData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar lead')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: (newLead) => {
      // Invalidar cache de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      
      toast.success('Lead criado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook para atualizar lead
export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation<LeadWithRelations, Error, { id: string; data: UpdateLeadData }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar lead')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: (updatedLead) => {
      // Atualizar cache específico do lead
      queryClient.setQueryData(['lead', updatedLead.id], updatedLead)
      
      // Invalidar cache de lista de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      
      toast.success('Lead atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook para excluir lead
export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (leadId) => {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir lead')
      }
    },
    onSuccess: (_, leadId) => {
      // Remover do cache específico
      queryClient.removeQueries({ queryKey: ['lead', leadId] })
      
      // Invalidar cache de lista de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      
      toast.success('Lead excluído com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Hook para operações em lote
export function useLeadBatchOperations() {
  const queryClient = useQueryClient()

  const updateStatus = useMutation<void, Error, { leadIds: string[]; status: string }>({
    mutationFn: async ({ leadIds, status }) => {
      const promises = leadIds.map(id => 
        fetch(`/api/leads/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })
      )

      const responses = await Promise.all(promises)
      
      const errors = responses.filter(r => !r.ok)
      if (errors.length > 0) {
        throw new Error(`${errors.length} leads falharam na atualização`)
      }
    },
    onSuccess: (_, { leadIds }) => {
      // Invalidar cache de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      
      // Invalidar cache específico de cada lead
      leadIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['lead', id] })
      })
      
      toast.success('Status dos leads atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return {
    updateStatus,
  }
}



