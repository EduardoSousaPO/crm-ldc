'use client'

import { useState, memo, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { LeadCard } from './LeadCard'
import { NewLeadModal } from './NewLeadModal'
import { DragFeedback } from './DragFeedback'
import { Settings, Eye, EyeOff, Grid, List } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface OptimizedKanbanBoardProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

// Configuração das colunas do Kanban - PROCESSO LDC (4 Fases)
const KANBAN_COLUMNS: Array<{
  id: LeadStatus
  title: string
  description: string
  color: string
  bgColor: string
  textColor: string
  phase: string
}> = [
  {
    id: 'lead_qualificado',
    title: 'Lead Qualificado',
    description: 'Leads qualificados automaticamente via IA + N8N',
    color: 'border-gray-200',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    phase: 'Fase 1: Qualificar'
  },
  {
    id: 'reuniao_agendada',
    title: 'R1 Agendada',
    description: 'Primeira reunião de diagnóstico marcada',
    color: 'border-gray-200',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    phase: 'Fase 2: Agendar R1'
  },
  {
    id: 'proposta_apresentada',
    title: 'R2 + Proposta',
    description: 'Estudo apresentado, proposta enviada + follow-up',
    color: 'border-gray-200',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    phase: 'Fase 3: Marcar R2'
  },
  {
    id: 'cliente_ativo',
    title: 'Cliente Assinado',
    description: 'Contrato assinado - Cliente ativo',
    color: 'border-gray-200',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    phase: 'Fase 4: Assinar'
  }
]

const OptimizedKanbanBoard = memo(({ 
  leads, 
  onUpdateLead, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: OptimizedKanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact')
  const [hiddenColumns, setHiddenColumns] = useState<Set<LeadStatus>>(new Set())
  const [filterByUser, setFilterByUser] = useState(!isAdmin) // Consultores veem apenas seus leads por padrão

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Menor distância para ativação mais rápida
        tolerance: 5,
        delay: 100, // Pequeno delay para evitar drags acidentais
      },
    })
  )

  // Memoizar leads filtrados
  const filteredLeads = useMemo(() => {
    if (filterByUser && !isAdmin) {
      return leads.filter(lead => lead.consultant_id === currentUserId)
    }
    return leads
  }, [leads, filterByUser, isAdmin, currentUserId])

  // Memoizar leads por coluna
  const leadsByColumn = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {} as Record<LeadStatus, Lead[]>
    
    KANBAN_COLUMNS.forEach(column => {
      grouped[column.id] = filteredLeads.filter(lead => lead.status === column.id)
    })
    
    return grouped
  }, [filteredLeads])

  // Memoizar colunas visíveis
  const visibleColumns = useMemo(() => {
    return KANBAN_COLUMNS.filter(column => !hiddenColumns.has(column.id))
  }, [hiddenColumns])

  // Estado para feedback visual do drag
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)

  // Callback para drag end otimizado com melhor feedback
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setIsDragging(false)
    setDragError(null)

    if (!over || !onUpdateLead) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    // Encontrar o lead
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    // Feedback otimista - atualizar UI imediatamente
    const originalStatus = lead.status
    
    try {
      // Mostrar loading state
      const loadingToast = toast.loading(`Movendo lead para ${getStatusLabel(newStatus)}...`)
      
      await onUpdateLead(leadId, { status: newStatus })
      
      // Sucesso
      toast.dismiss(loadingToast)
      toast.success(`Lead movido para ${getStatusLabel(newStatus)}!`, {
        duration: 2000,
        icon: '🎯'
      })
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error)
      
      // Reverter mudança em caso de erro
      setDragError('Erro ao mover lead. Tente novamente.')
      toast.error('Erro ao mover lead. Tente novamente.', {
        duration: 3000,
        icon: '❌'
      })
      
      // Limpar erro após 3 segundos
      setTimeout(() => setDragError(null), 3000)
    }
  }, [leads, onUpdateLead])

  // Função auxiliar para obter label do status
  const getStatusLabel = useCallback((status: LeadStatus) => {
    const column = KANBAN_COLUMNS.find(col => col.id === status)
    return column?.title || status
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
    setDragError(null)
    
    // Feedback sonoro e visual sutil
    const lead = leads.find(l => l.id === event.active.id)
    if (lead) {
      toast(`Arrastando: ${lead.name}`, {
        duration: 1500,
        icon: '👋',
        style: {
          background: '#f3f4f6',
          color: '#374151',
          fontSize: '14px'
        }
      })
    }
  }, [leads])

  // Toggle visibilidade de coluna
  const toggleColumnVisibility = useCallback((columnId: LeadStatus) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }, [])

  // Função para criar lead usando a API
  const handleCreateLead = useCallback(async (leadData: any) => {
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

      const result = await response.json()
      
      // Chamar callback se fornecido
      if (onLeadCreate) {
        await onLeadCreate(result.data)
      }
      
      return result.data
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      throw error
    }
  }, [currentUserId, onLeadCreate])

  // Encontrar lead ativo para drag overlay
  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Feedback de Drag */}
      <DragFeedback 
        isDragging={isDragging} 
        leadName={activeLead?.name || ''} 
      />
      
      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto px-6">
            <div className="flex gap-6 h-full min-w-full">
              {visibleColumns.map((column) => (
                <div key={column.id} className="flex flex-col flex-1 min-w-64 lg:min-w-72">
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    description={column.description}
                    color={column.color}
                    bgColor={column.bgColor}
                    textColor={column.textColor}
                    phase={column.phase}
                    leads={leadsByColumn[column.id] || []}
                    onLeadUpdate={onUpdateLead || (() => Promise.resolve())}
                    onLeadCreate={handleCreateLead}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="rotate-2 scale-105 opacity-95 shadow-2xl transform transition-all duration-200 ease-out">
                <div className="border-2 border-blue-400 rounded-lg bg-white/95 backdrop-blur-sm">
                  <LeadCard
                    lead={activeLead}
                    currentUserId={currentUserId}
                    isDragging={true}
                  />
                </div>
                {/* Indicador visual de drag */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal Novo Lead */}
      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={async (leadData: any) => {
            try {
              const { createSupabaseClient } = await import('@/lib/supabase')
              const supabase = createSupabaseClient()
              
              const { error } = await (supabase as any)
                .from('leads')
                .insert({
                  ...leadData,
                  consultant_id: currentUserId
                })
              
              if (error) throw error
              
              setIsNewLeadModalOpen(false)
              // Recarregar dados seria ideal aqui
              window.location.reload()
            } catch (error) {
              console.error('Erro ao criar lead:', error)
            }
          }}
        />
    </div>
  )
})

OptimizedKanbanBoard.displayName = 'OptimizedKanbanBoard'

export { OptimizedKanbanBoard }

