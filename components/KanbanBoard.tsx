'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { LeadCard } from './LeadCard'
import { NewLeadModal } from './NewLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface KanbanBoardProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadUpdate?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

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
    description: 'Necessidades mapeadas',
    color: 'bg-cyan-500'
  },
  {
    id: 'proposta_apresentada',
    title: 'Proposta Apresentada',
    description: 'Solução apresentada ao cliente',
    color: 'bg-green-500'
  },
  {
    id: 'em_negociacao',
    title: 'Em Negociação',
    description: 'Follow-up e ajustes',
    color: 'bg-yellow-500'
  },
  {
    id: 'cliente_ativo',
    title: 'Cliente Ativo',
    description: 'Contrato assinado',
    color: 'bg-emerald-500'
  },
]

export function KanbanBoard({ 
  leads, 
  onUpdateLead, 
  onLeadUpdate, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    const lead = leads.find(l => l.id === leadId)
    if (lead && lead.status !== newStatus && onLeadUpdate) {
      onLeadUpdate(leadId, { status: newStatus })
    }

    setActiveId(null)
  }

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status)
  }

  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-medium">{leads.length}</span> leads
        </div>
        <button
          onClick={() => setIsNewLeadModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>+</span>
          <span>Novo Lead</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              description={column.description}
              color={column.color}
              leads={getLeadsByStatus(column.id)}
              onLeadUpdate={onLeadUpdate || (() => Promise.resolve())}
              currentUserId={currentUserId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="rotate-3 scale-105">
              <LeadCard lead={activeLead} isDragging currentUserId={currentUserId} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSubmit={onLeadCreate || (() => Promise.resolve())}
      />
    </>
  )
}
