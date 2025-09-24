'use client'

import { useCallback, useRef, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface UseOptimizedDragDropProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
}

interface UseOptimizedDragDropReturn {
  handleDragStart: (leadId: string) => void
  handleDragEnd: (leadId: string, newStatus: LeadStatus) => Promise<void>
  handleCreateLead: (leadData: any) => Promise<void>
  leadsByColumn: Map<LeadStatus, Lead[]>
  getLeadById: (leadId: string) => Lead | undefined
}

// Status válidos para o Kanban
const VALID_STATUSES: LeadStatus[] = [
  'lead_qualificado',
  'reuniao_agendada', 
  'proposta_apresentada',
  'cliente_ativo'
]

export function useOptimizedDragDrop({
  leads,
  onUpdateLead,
  onLeadCreate
}: UseOptimizedDragDropProps): UseOptimizedDragDropReturn {
  
  // Cache para leads por ID (otimização de lookup)
  const leadsMapRef = useRef(new Map<string, Lead>())
  
  // Cache para performance tracking
  const performanceRef = useRef({
    dragStartTime: 0,
    updateCount: 0,
    averageUpdateTime: 0
  })

  // Memoização otimizada dos leads por coluna
  const leadsByColumn = useMemo(() => {
    const grouped = new Map<LeadStatus, Lead[]>()
    const leadsMap = new Map<string, Lead>()
    
    // Inicializar todas as colunas
    VALID_STATUSES.forEach(status => {
      grouped.set(status, [])
    })
    
    // Agrupar leads e criar cache de lookup
    leads.forEach(lead => {
      leadsMap.set(lead.id, lead)
      
      const status = lead.status as LeadStatus
      if (VALID_STATUSES.includes(status)) {
        const columnLeads = grouped.get(status)
        if (columnLeads) {
          columnLeads.push(lead)
        }
      }
    })
    
    // Atualizar cache
    leadsMapRef.current = leadsMap
    
    return grouped
  }, [leads])

  // Função otimizada para buscar lead por ID
  const getLeadById = useCallback((leadId: string): Lead | undefined => {
    return leadsMapRef.current.get(leadId)
  }, [])

  // Handler otimizado para início do drag
  const handleDragStart = useCallback((leadId: string) => {
    performanceRef.current.dragStartTime = performance.now()
    
    // Pré-carregar dados do lead para evitar lookup durante drag
    const lead = getLeadById(leadId)
    if (!lead) {
      console.warn(`Lead ${leadId} não encontrado durante drag start`)
    }
  }, [getLeadById])

  // Handler ultra-otimizado para fim do drag
  const handleDragEnd = useCallback(async (leadId: string, newStatus: LeadStatus) => {
    const startTime = performance.now()
    const lead = getLeadById(leadId)
    
    if (!lead || !onUpdateLead) {
      return
    }

    // Verificar se realmente mudou de status
    if (lead.status === newStatus) {
      return
    }

    // Validar status
    if (!VALID_STATUSES.includes(newStatus)) {
      console.error(`Status inválido: ${newStatus}`)
      return
    }

    try {
      // Atualização com timeout para evitar travamentos
      const updatePromise = onUpdateLead(leadId, { status: newStatus })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      await Promise.race([updatePromise, timeoutPromise])
      
      // Feedback apenas para drags intencionais
      const dragDuration = performanceRef.current.dragStartTime > 0 
        ? startTime - performanceRef.current.dragStartTime 
        : 0
      
      if (dragDuration > 100) { // Apenas drags > 100ms
        toast.success('Lead movido', {
          duration: 1000,
          position: 'bottom-right',
        })
      }

      // Métricas de performance
      const updateTime = performance.now() - startTime
      performanceRef.current.updateCount++
      performanceRef.current.averageUpdateTime = 
        (performanceRef.current.averageUpdateTime + updateTime) / 2

      // Log performance em desenvolvimento
      if (process.env.NODE_ENV === 'development' && updateTime > 1000) {
        console.warn(`Update lento detectado: ${updateTime.toFixed(2)}ms`)
      }

    } catch (error) {
      console.error('Erro ao mover lead:', error)
      
      // Toast de erro apenas se não for timeout
      const isTimeout = error instanceof Error && error.message === 'Timeout'
      toast.error(isTimeout ? 'Operação demorou muito' : 'Erro ao mover lead', {
        duration: 2000,
        position: 'bottom-right',
      })
    }
  }, [getLeadById, onUpdateLead])

  // Handler otimizado para criação de leads
  const handleCreateLead = useCallback(async (leadData: any) => {
    if (!onLeadCreate) return

    const startTime = performance.now()
    
    try {
      // Validar dados essenciais
      if (!leadData.name?.trim()) {
        throw new Error('Nome é obrigatório')
      }

      if (!leadData.email?.trim() && !leadData.phone?.trim()) {
        throw new Error('Email ou telefone é obrigatório')
      }

      // Criar lead com timeout
      const createPromise = onLeadCreate(leadData)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
      
      await Promise.race([createPromise, timeoutPromise])
      
      toast.success('Lead criado', {
        duration: 1000,
        position: 'bottom-right',
      })

      // Log performance em desenvolvimento
      const createTime = performance.now() - startTime
      if (process.env.NODE_ENV === 'development' && createTime > 2000) {
        console.warn(`Criação lenta detectada: ${createTime.toFixed(2)}ms`)
      }

    } catch (error) {
      console.error('Erro ao criar lead:', error)
      
      const isTimeout = error instanceof Error && error.message === 'Timeout'
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      toast.error(isTimeout ? 'Operação demorou muito' : errorMessage, {
        duration: 3000,
        position: 'bottom-right',
      })
    }
  }, [onLeadCreate])

  return {
    handleDragStart,
    handleDragEnd,
    handleCreateLead,
    leadsByColumn,
    getLeadById
  }
}

// Hook para métricas de performance (desenvolvimento)
export function useDragDropMetrics() {
  const getMetrics = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      return null
    }
    
    return {
      updateCount: 0,
      averageUpdateTime: 0,
      memoryUsage: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576),
      } : null
    }
  }, [])

  return { getMetrics }
}
