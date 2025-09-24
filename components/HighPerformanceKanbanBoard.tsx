'use client'

import { useState, memo, useCallback, useMemo, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { HighPerformanceKanbanColumn } from './HighPerformanceKanbanColumn'
import { VirtualizedLeadCard } from './VirtualizedLeadCard'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface HighPerformanceKanbanBoardProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

// Configuração otimizada das colunas
const KANBAN_COLUMNS: Array<{
  id: LeadStatus
  title: string
  description: string
}> = [
  {
    id: 'lead_qualificado',
    title: 'Lead Qualificado',
    description: 'Leads qualificados automaticamente via IA + N8N',
  },
  {
    id: 'reuniao_agendada',
    title: 'R1 Agendada',
    description: 'Primeira reunião de diagnóstico marcada',
  },
  {
    id: 'proposta_apresentada',
    title: 'R2 + Proposta',
    description: 'Estudo apresentado, proposta enviada + follow-up',
  },
  {
    id: 'cliente_ativo',
    title: 'Cliente Assinado',
    description: 'Contrato assinado - Cliente ativo',
  }
]

const HighPerformanceKanbanBoard = memo(({ 
  leads, 
  onUpdateLead, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: HighPerformanceKanbanBoardProps) => {
  // Estados otimizados - apenas o essencial
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  
  // Refs para evitar re-renders
  const draggedLeadRef = useRef<Lead | null>(null)
  const dragStartTimeRef = useRef<number>(0)

  // Sensors ultra-otimizados para performance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Menor distância para resposta mais rápida
        tolerance: 5,
        delay: 50, // Delay mínimo para evitar drags acidentais
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Memoização otimizada dos leads por coluna
  const leadsByColumn = useMemo(() => {
    const grouped = new Map<LeadStatus, Lead[]>()
    
    // Inicializar todas as colunas
    KANBAN_COLUMNS.forEach(column => {
      grouped.set(column.id, [])
    })
    
    // Agrupar leads de forma eficiente
    leads.forEach(lead => {
      const columnLeads = grouped.get(lead.status as LeadStatus)
      if (columnLeads) {
        columnLeads.push(lead)
      }
    })
    
    return grouped
  }, [leads])

  // Handler otimizado para início do drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const leadId = event.active.id as string
    const lead = leads.find(l => l.id === leadId)
    
    if (lead) {
      setActiveId(leadId)
      draggedLeadRef.current = lead
      dragStartTimeRef.current = performance.now()
    }
  }, [leads])

  // Handler otimizado para drag over (sem toast para performance)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }, [])

  // Handler ultra-otimizado para fim do drag
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    const dragTime = performance.now() - dragStartTimeRef.current
    
    // Limpar estados imediatamente
    setActiveId(null)
    setOverId(null)
    
    if (!over || !onUpdateLead || !draggedLeadRef.current) {
      draggedLeadRef.current = null
      return
    }

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus
    const lead = draggedLeadRef.current

    // Verificar se realmente mudou de status
    if (lead.status === newStatus) {
      draggedLeadRef.current = null
      return
    }

    try {
      // Atualização otimista para UX instantânea
      await onUpdateLead(leadId, { status: newStatus })
      
      // Toast apenas para drags intencionais (> 100ms)
      if (dragTime > 100) {
        const column = KANBAN_COLUMNS.find(col => col.id === newStatus)
        toast.success(`Movido para ${column?.title}`, {
          duration: 1500,
          position: 'bottom-right',
        })
      }
    } catch (error) {
      console.error('Erro ao mover lead:', error)
      toast.error('Erro ao mover lead', {
        duration: 2000,
        position: 'bottom-right',
      })
    } finally {
      draggedLeadRef.current = null
    }
  }, [onUpdateLead])

  // Função para criar lead otimizada
  const handleCreateLead = useCallback(async (leadData: any) => {
    if (!onLeadCreate) return
    
    try {
      await onLeadCreate(leadData)
      toast.success('Lead criado!', {
        duration: 1500,
        position: 'bottom-right',
      })
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead', {
        duration: 2000,
        position: 'bottom-right',
      })
    }
  }, [onLeadCreate])

  // Lead ativo memoizado
  const activeLead = useMemo(() => {
    return activeId ? leads.find(lead => lead.id === activeId) : null
  }, [activeId, leads])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Kanban Board Ultra-Performático */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto px-6 py-4">
            <div className="flex gap-6 h-full min-w-max">
              {KANBAN_COLUMNS.map((column) => (
                <HighPerformanceKanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  description={column.description}
                  leads={leadsByColumn.get(column.id) || []}
                  onLeadCreate={handleCreateLead}
                  currentUserId={currentUserId}
                  isOver={overId === column.id}
                />
              ))}
            </div>
          </div>

          {/* DragOverlay Ultra-Leve */}
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
            {activeLead ? (
              <div className="rotate-1 scale-105 shadow-2xl">
                <VirtualizedLeadCard
                  lead={activeLead}
                  currentUserId={currentUserId}
                  isDragging={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
})

HighPerformanceKanbanBoard.displayName = 'HighPerformanceKanbanBoard'

export default HighPerformanceKanbanBoard
