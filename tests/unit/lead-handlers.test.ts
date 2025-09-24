/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Mock do fetch global
global.fetch = jest.fn()

// Mock do toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}))

// Função helper para criar wrapper com React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Função simulada de handleUpdateLead
const createHandleUpdateLead = (queryClient: QueryClient) => {
  return async (leadId: string, updates: any) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar lead')
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
      toast.success('Lead atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast.error('Erro ao atualizar lead')
      throw error
    }
  }
}

// Função simulada de handleCreateLead
const createHandleCreateLead = (queryClient: QueryClient, currentUserId: string) => {
  return async (leadData: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          consultant_id: currentUserId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar lead')
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
      toast.success('Lead criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead')
      throw error
    }
  }
}

describe('Lead Handlers', () => {
  let queryClient: QueryClient
  let handleUpdateLead: ReturnType<typeof createHandleUpdateLead>
  let handleCreateLead: ReturnType<typeof createHandleCreateLead>
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      }
    })
    
    handleUpdateLead = createHandleUpdateLead(queryClient)
    handleCreateLead = createHandleCreateLead(queryClient, 'user-123')
    
    // Reset mocks
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('handleUpdateLead', () => {
    it('should update lead successfully', async () => {
      // Mock successful response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'lead-123', name: 'Updated Lead', status: 'reuniao_agendada' }
        })
      })

      // Mock queryClient.invalidateQueries
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      await handleUpdateLead('lead-123', { status: 'reuniao_agendada' })

      // Verificar chamadas
      expect(fetch).toHaveBeenCalledWith('/api/leads/lead-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reuniao_agendada' })
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['admin-leads'] })
      expect(toast.success).toHaveBeenCalledWith('Lead atualizado com sucesso!')
    })

    it('should handle update errors', async () => {
      // Mock error response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Lead não encontrado' })
      })

      await expect(handleUpdateLead('invalid-id', { status: 'reuniao_agendada' }))
        .rejects.toThrow('Lead não encontrado')

      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar lead')
    })

    it('should handle network errors', async () => {
      // Mock network error
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(handleUpdateLead('lead-123', { status: 'reuniao_agendada' }))
        .rejects.toThrow('Network error')

      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar lead')
    })
  })

  describe('handleCreateLead', () => {
    it('should create lead successfully', async () => {
      const newLeadData = {
        name: 'Novo Lead',
        email: 'novo@example.com',
        phone: '(11) 99999-9999',
        origin: 'website'
      }

      // Mock successful response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'lead-456', ...newLeadData, consultant_id: 'user-123' }
        })
      })

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      await handleCreateLead(newLeadData)

      expect(fetch).toHaveBeenCalledWith('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeadData,
          consultant_id: 'user-123'
        })
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['admin-leads'] })
      expect(toast.success).toHaveBeenCalledWith('Lead criado com sucesso!')
    })

    it('should handle validation errors', async () => {
      // Mock validation error
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Dados inválidos',
          details: [{ message: 'Nome é obrigatório' }]
        })
      })

      await expect(handleCreateLead({ email: 'test@example.com' }))
        .rejects.toThrow('Dados inválidos')

      expect(toast.error).toHaveBeenCalledWith('Erro ao criar lead')
    })

    it('should handle duplicate email errors', async () => {
      // Mock duplicate error
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Lead com este email já existe' })
      })

      const duplicateLeadData = {
        name: 'Lead Duplicado',
        email: 'existente@example.com'
      }

      await expect(handleCreateLead(duplicateLeadData))
        .rejects.toThrow('Lead com este email já existe')

      expect(toast.error).toHaveBeenCalledWith('Erro ao criar lead')
    })
  })

  describe('Drag and Drop Handler', () => {
    it('should update lead status on drag end', async () => {
      // Mock successful response
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'lead-123', status: 'proposta_apresentada' }
        })
      })

      // Simular drag and drop
      const dragEndEvent = {
        active: { id: 'lead-123' },
        over: { id: 'proposta_apresentada' }
      }

      // Simular handler de drag end
      if (dragEndEvent.active.id !== dragEndEvent.over?.id) {
        const leadId = dragEndEvent.active.id as string
        const newStatus = dragEndEvent.over?.id as string

        await handleUpdateLead(leadId, { status: newStatus })
      }

      expect(fetch).toHaveBeenCalledWith('/api/leads/lead-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'proposta_apresentada' })
      })
    })
  })

  describe('Validation', () => {
    it('should validate required fields before API call', async () => {
      const invalidLeadData = {
        name: '',
        email: '',
        phone: ''
      }

      // Simular validação local (antes da API)
      const validateLead = (data: any) => {
        if (!data.name?.trim()) {
          throw new Error('Nome é obrigatório')
        }
        if (!data.email?.trim() && !data.phone?.trim()) {
          throw new Error('Email ou telefone é obrigatório')
        }
      }

      expect(() => validateLead(invalidLeadData)).toThrow('Nome é obrigatório')
    })

    it('should validate email format', () => {
      const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(validateEmail('valid@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('Query Invalidation', () => {
    it('should invalidate correct queries after operations', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      await handleUpdateLead('lead-123', { status: 'cliente_ativo' })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['admin-leads'] })
    })

    it('should handle query invalidation errors gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      // Mock invalidateQueries to throw error
      jest.spyOn(queryClient, 'invalidateQueries').mockRejectedValueOnce(new Error('Cache error'))

      // Should not throw - invalidation errors should be handled gracefully
      await expect(handleUpdateLead('lead-123', { status: 'cliente_ativo' })).resolves.not.toThrow()
    })
  })
})
