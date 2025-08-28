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
import { KanbanColumnOptimized } from './KanbanColumnOptimized'
import { KanbanCardCompact } from './KanbanCardCompact'
import { SuspenseNewLeadModal } from './LazyComponents'
import { Settings, Eye, EyeOff, Grid, List } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface OptimizedKanbanBoardProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

// Configuração das colunas do Kanban
const KANBAN_COLUMNS: Array<{
  id: LeadStatus
  title: string
  description: string
  color: string
}> = [
  {
    id: 'lead_qualificado',
    title: 'Lead Qualificado',
    description: 'Leads validados e prontos para contato',
    color: 'bg-blue-500'
  },
  {
    id: 'contato_inicial',
    title: 'Contato Inicial',
    description: 'Primeiro contato realizado',
    color: 'bg-purple-500'
  },
  {
    id: 'reuniao_agendada',
    title: 'Reunião Agendada',
    description: 'R1 ou R2 marcada',
    color: 'bg-indigo-500'
  },
  {
    id: 'discovery_concluido',
    title: 'Discovery Concluído',
    description: 'Discovery realizado',
    color: 'bg-cyan-500'
  },
  {
    id: 'proposta_apresentada',
    title: 'Proposta Apresentada',
    description: 'Proposta comercial apresentada',
    color: 'bg-amber-500'
  },
  {
    id: 'em_negociacao',
    title: 'Em Negociação',
    description: 'Em processo de negociação',
    color: 'bg-orange-500'
  },
  {
    id: 'cliente_ativo',
    title: 'Cliente Ativo',
    description: 'Contrato assinado',
    color: 'bg-emerald-500'
  }
]

const OptimizedKanbanBoard = memo(({ 
  leads, 
  onUpdateLead, 
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
        distance: 8,
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

  // Callback para drag end otimizado
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !onUpdateLead) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    // Encontrar o lead
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    try {
      await onUpdateLead(leadId, { status: newStatus })
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error)
    }
  }, [leads, onUpdateLead])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

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

  // Encontrar lead ativo para drag overlay
  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
      {/* Controles do Kanban */}
      <div className="flex-shrink-0 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Pipeline de Vendas</h2>
            
            {/* Toggle View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'compact' 
                    ? 'bg-petroleum-100 text-petroleum-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Alternar visualização"
              >
                {viewMode === 'compact' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filtro por usuário (apenas para admin) */}
            {isAdmin && (
              <button
                onClick={() => setFilterByUser(!filterByUser)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterByUser 
                    ? 'bg-petroleum-100 text-petroleum-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{filterByUser ? 'Meus Leads' : 'Todos os Leads'}</span>
              </button>
            )}

            {/* Configurações */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
          <span>Total: <strong>{filteredLeads.length}</strong> leads</span>
          <span>Ativos: <strong>{filteredLeads.filter(l => l.status !== 'cliente_ativo').length}</strong></span>
          <span>Convertidos: <strong>{filteredLeads.filter(l => l.status === 'cliente_ativo').length}</strong></span>
          <span>Taxa: <strong>
            {filteredLeads.length > 0 
              ? ((filteredLeads.filter(l => l.status === 'cliente_ativo').length / filteredLeads.length) * 100).toFixed(1)
              : 0}%
          </strong></span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto px-4">
            <div className="grid grid-cols-7 gap-4 h-full py-4 min-w-full max-w-6xl mx-auto">
              {visibleColumns.map((column) => (
                <div key={column.id} className="flex flex-col min-w-0">
                  <KanbanColumnOptimized
                    id={column.id}
                    title={column.title}
                    description={column.description}
                    color={column.color}
                    leads={leadsByColumn[column.id] || []}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onAddLead={() => setIsNewLeadModalOpen(true)}
                  />
                </div>
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeLead ? (
              <KanbanCardCompact
                lead={activeLead}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal Novo Lead */}
      {isNewLeadModalOpen && (
        <SuspenseNewLeadModal
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
      )}
    </div>
  )
})

OptimizedKanbanBoard.displayName = 'OptimizedKanbanBoard'

export { OptimizedKanbanBoard }

