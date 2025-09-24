import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { useConsultorDashboard } from '@/hooks/useConsultorDashboard'
import { createSupabaseClient } from '@/lib/supabase'

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  createSupabaseClient: jest.fn(),
}))

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      order: jest.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    }))
  }))
}

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useAdminDashboard Hook', () => {
  const Wrapper = createWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createSupabaseClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  test('deve retornar loading inicial', () => {
    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: Wrapper
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.leads).toEqual([])
    expect(result.current.consultors).toEqual([])
  })

  test('deve calcular estatísticas corretamente', async () => {
    // Mock de dados
    const mockLeads = [
      { id: '1', status: 'lead_qualificado', consultant_id: 'c1' },
      { id: '2', status: 'cliente_ativo', consultant_id: 'c1' },
      { id: '3', status: 'lead_qualificado', consultant_id: 'c2' },
    ]

    const mockConsultors = [
      { id: 'c1', name: 'Consultor 1', role: 'consultor' },
      { id: 'c2', name: 'Consultor 2', role: 'consultor' },
    ]

    // Configurar mocks específicos para leads
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            order: () => Promise.resolve({
              data: mockLeads,
              error: null
            })
          })
        }
      }
      
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: mockConsultors,
                error: null
              })
            })
          })
        }
      }
      
      return {
        select: () => ({
          order: () => Promise.resolve({
            data: [],
            error: null
          })
        })
      }
    })

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stats.totalLeads).toBe(3)
    expect(result.current.stats.activeConsultors).toBe(2)
    expect(result.current.stats.conversionRate).toBe(33) // 1 cliente ativo de 3 leads
  })

  test('deve lidar com erro na busca', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: null,
          error: { message: 'Erro de conexão' }
        })
      })
    }))

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.leads).toEqual([])
  })
})

describe('useConsultorDashboard Hook', () => {
  const Wrapper = createWrapper()
  const mockConsultorId = 'consultor-123'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createSupabaseClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  test('deve filtrar leads por consultor', async () => {
    const mockLeads = [
      { id: '1', status: 'lead_qualificado', consultant_id: mockConsultorId },
      { id: '2', status: 'cliente_ativo', consultant_id: mockConsultorId },
    ]

    const mockTasks = [
      { id: 't1', status: 'pending', assigned_to: mockConsultorId },
      { id: 't2', status: 'completed', assigned_to: mockConsultorId },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            eq: (field: string, value: string) => {
              expect(field).toBe('consultant_id')
              expect(value).toBe(mockConsultorId)
              return {
                order: () => Promise.resolve({
                  data: mockLeads,
                  error: null
                })
              }
            }
          })
        }
      }
      
      if (table === 'tasks') {
        return {
          select: () => ({
            eq: (field: string, value: string) => {
              expect(field).toBe('assigned_to')
              expect(value).toBe(mockConsultorId)
              return {
                order: () => Promise.resolve({
                  data: mockTasks,
                  error: null
                })
              }
            }
          })
        }
      }
      
      return {
        select: () => ({
          order: () => Promise.resolve({
            data: [],
            error: null
          })
        })
      }
    })

    const { result } = renderHook(() => useConsultorDashboard(mockConsultorId), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.leads).toEqual(mockLeads)
    expect(result.current.tasks).toEqual(mockTasks)
    expect(result.current.stats.totalLeads).toBe(2)
    expect(result.current.stats.pendingTasks).toBe(1)
  })

  test('deve calcular leads ativos corretamente', async () => {
    const mockLeads = [
      { id: '1', status: 'lead_qualificado', consultant_id: mockConsultorId },
      { id: '2', status: 'cliente_ativo', consultant_id: mockConsultorId },
      { id: '3', status: 'reuniao_agendada', consultant_id: mockConsultorId },
      { id: '4', status: 'proposta_apresentada', consultant_id: mockConsultorId },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: mockLeads,
                error: null
              })
            })
          })
        }
      }
      
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: [],
              error: null
            })
          })
        })
      }
    })

    const { result } = renderHook(() => useConsultorDashboard(mockConsultorId), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Leads ativos são todos exceto cliente_ativo
    expect(result.current.stats.activeLeads).toBe(3)
    expect(result.current.stats.conversionRate).toBe(25) // 1 cliente ativo de 4 leads
  })

  test('não deve fazer query se consultorId não fornecido', () => {
    const { result } = renderHook(() => useConsultorDashboard(''), {
      wrapper: Wrapper
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.leads).toEqual([])
    expect(result.current.tasks).toEqual([])
  })
})

describe('Hook Error Handling', () => {
  const Wrapper = createWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('useAdminDashboard deve lidar com erro de rede', async () => {
    const mockErrorSupabase = {
      from: () => ({
        select: () => ({
          order: () => Promise.reject(new Error('Network Error'))
        })
      })
    }

    ;(createSupabaseClient as jest.Mock).mockReturnValue(mockErrorSupabase)

    const { result } = renderHook(() => useAdminDashboard(), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Network Error')
  })

  test('useConsultorDashboard deve lidar com dados nulos', async () => {
    const mockNullSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: null,
              error: null
            })
          })
        })
      })
    }

    ;(createSupabaseClient as jest.Mock).mockReturnValue(mockNullSupabase)

    const { result } = renderHook(() => useConsultorDashboard('test-id'), {
      wrapper: Wrapper
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.leads).toEqual([])
    expect(result.current.tasks).toEqual([])
    expect(result.current.stats.totalLeads).toBe(0)
  })
})
