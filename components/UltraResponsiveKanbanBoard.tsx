'use client'

import { useState, memo, useCallback, useMemo, useRef, useEffect } from 'react'
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
import { UltraResponsiveKanbanColumn } from './UltraResponsiveKanbanColumn'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface UltraResponsiveKanbanBoardProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

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

const UltraResponsiveKanbanBoard = memo(({ 
  leads, 
  onUpdateLead, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: UltraResponsiveKanbanBoardProps) => {
  
  // Estados mínimos para máxima performance
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Refs para dados que não precisam causar re-render
  const draggedLeadRef = useRef<Lead | null>(null)
  const updateInProgressRef = useRef<boolean>(false)

  // Sensors ultra-responsivos - ZERO delay, ZERO distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // ZERO distance para resposta instantânea
        tolerance: 0, // ZERO tolerance
        delay: 0,     // ZERO delay
      },
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

  // Handler otimizado para início do drag - INSTANTÂNEO
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const leadId = event.active.id as string
    const lead = leads.find(l => l.id === leadId)
    
    if (lead) {
      setActiveId(leadId)
      draggedLeadRef.current = lead
    }
  }, [leads])

  // Handler ultra-otimizado para fim do drag - SEM DELAYS
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    
    // Limpar estado imediatamente para UX instantânea
    setActiveId(null)
    
    if (!over || !onUpdateLead || !draggedLeadRef.current || updateInProgressRef.current) {
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

    // Prevenir múltiplas atualizações simultâneas
    updateInProgressRef.current = true

    try {
      // Atualização direta - SEM loading toast para performance
      await onUpdateLead(leadId, { status: newStatus })
      
      
      // Toast mínimo apenas no final
      const column = KANBAN_COLUMNS.find(col => col.id === newStatus)
      toast.success(`→ ${column?.title}`, {
        duration: 1000,
        position: 'bottom-right',
      })
    } catch (error) {
      console.error('Erro ao mover lead:', error)
      toast.error('Erro ao mover', {
        duration: 1500,
        position: 'bottom-right',
      })
    } finally {
      draggedLeadRef.current = null
      updateInProgressRef.current = false
    }
  }, [onUpdateLead])

  // Função para criar lead otimizada
  const handleCreateLead = useCallback(async (leadData: any) => {
    if (!onLeadCreate) return
    
    try {
      await onLeadCreate(leadData)
      toast.success('Lead criado', {
        duration: 1000,
        position: 'bottom-right',
      })
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar', {
        duration: 1500,
        position: 'bottom-right',
      })
    }
  }, [onLeadCreate])

  // Lead ativo memoizado
  const activeLead = useMemo(() => {
    return activeId ? leads.find(lead => lead.id === activeId) : null
  }, [activeId, leads])

  return (
    <div className="h-full flex flex-col bg-white" style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Kanban Board Ultra-Responsivo */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto px-6 py-4">
            <div className="flex gap-6 h-full min-w-max">
              {KANBAN_COLUMNS.map((column) => (
                <UltraResponsiveKanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  description={column.description}
                  leads={leadsByColumn.get(column.id) || []}
                  onLeadCreate={handleCreateLead}
                  onLeadUpdate={onUpdateLead}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>

          {/* DragOverlay Ultra-Simples para máxima performance */}
          <DragOverlay 
            dropAnimation={{ 
              duration: 150, // Mais rápido
              easing: 'ease-out' 
            }}
            style={{ 
              cursor: 'grabbing'
            }}
          >
            {activeLead ? (
              // Card HTML puro para máxima performance - SEM componentes React complexos
              <div 
                className="bg-white rounded-lg p-4 border-2 border-blue-400 shadow-2xl transform rotate-2 scale-105"
                style={{
                  width: '280px',
                  pointerEvents: 'none',
                  willChange: 'transform',
                }}
              >
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-900 leading-tight">
                    {activeLead.name}
                  </h4>
                </div>
                {activeLead.email && (
                  <div className="text-xs text-gray-600 mb-2">
                    📧 {activeLead.email}
                  </div>
                )}
                {activeLead.phone && (
                  <div className="text-xs text-gray-600 mb-2">
                    📱 {activeLead.phone}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Arrastando...</span>
                  {activeLead.score && activeLead.score > 0 && (
                    <span className="font-medium">
                      {activeLead.score}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
})

UltraResponsiveKanbanBoard.displayName = 'UltraResponsiveKanbanBoard'

export default UltraResponsiveKanbanBoard
