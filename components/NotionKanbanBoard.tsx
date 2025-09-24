'use client'

import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { toast } from 'react-hot-toast'
import { OptimizedLeadModal } from './OptimizedLeadModal'
import { QuickAddLeadModal } from './QuickAddLeadModal'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Plus,
  Upload,
  Download,
  UserCheck
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface NotionKanbanBoardProps {
  leads: Lead[]
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>
  onCreateLead?: (leadData: Partial<Lead>) => Promise<void>
  userRole?: 'admin' | 'consultor'
  userName?: string
  onImport?: () => void
  onExport?: () => void
  onAssignLeads?: () => void
}

const KANBAN_COLUMNS: Array<{
  id: LeadStatus
  title: string
  icon: React.ReactNode
}> = [
  {
    id: 'lead_qualificado',
    title: 'Leads Qualificados',
    icon: <User className="notion-card-icon" />
  },
  {
    id: 'reuniao_agendada', 
    title: 'Reunião Agendada',
    icon: <Calendar className="notion-card-icon" />
  },
  {
    id: 'proposta_apresentada',
    title: 'Proposta Apresentada', 
    icon: <Target className="notion-card-icon" />
  },
  {
    id: 'cliente_ativo',
    title: 'Clientes Ativos',
    icon: <TrendingUp className="notion-card-icon" />
  }
]

export function NotionKanbanBoard({ 
  leads, 
  onUpdateLead, 
  onCreateLead,
  userRole = 'consultor',
  userName = 'Usuário',
  onImport,
  onExport,
  onAssignLeads
}: NotionKanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const updateInProgressRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  // Agrupar leads por status
  const leadsByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = leads.filter(lead => lead.status === column.id)
    return acc
  }, {} as Record<LeadStatus, Lead[]>)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id)
    if (lead) {
      setDraggedLead(lead)
    }
  }, [leads])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedLead(null)

    if (!over || active.id === over.id) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus
    const lead = leads.find(l => l.id === leadId)

    if (!lead || lead.status === newStatus || updateInProgressRef.current) return

    updateInProgressRef.current = true

    try {
      await onUpdateLead(leadId, { status: newStatus })
      
      const column = KANBAN_COLUMNS.find(col => col.id === newStatus)
      toast.success(`Movido para ${column?.title}`, {
        duration: 2000,
        position: 'bottom-right',
      })
    } catch (error) {
      console.error('Erro ao mover lead:', error)
      toast.error('Erro ao mover lead', {
        duration: 3000,
        position: 'bottom-right',
      })
    } finally {
      updateInProgressRef.current = false
    }
  }, [leads, onUpdateLead])

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<LeadStatus | null>(null)

  // Handler para criação de leads via modal
  const handleQuickAddLead = useCallback(async (leadData: any) => {
    if (onCreateLead && selectedColumn) {
      await onCreateLead({
        ...leadData,
        status: selectedColumn
      })
      setIsQuickAddModalOpen(false)
      setSelectedColumn(null)
    }
  }, [onCreateLead, selectedColumn])

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div 
      className="notion-card cursor-pointer"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id)
        setDraggedLead(lead)
      }}
      onClick={() => {
        setSelectedLead(lead)
        setIsDetailModalOpen(true)
      }}
    >
      <div className="notion-card-score">
        {lead.score || 0}
      </div>
      
      <div className="notion-card-title">
        {lead.name}
      </div>
      
      <div className="notion-card-meta">
        {lead.email && (
          <div className="notion-card-field">
            <Mail className="notion-card-icon" />
            <span>{lead.email}</span>
          </div>
        )}
        
        {lead.phone && (
          <div className="notion-card-field">
            <Phone className="notion-card-icon" />
            <span>{lead.phone}</span>
          </div>
        )}
        
        <div className="notion-card-field">
          <Clock className="notion-card-icon" />
          <span>{new Date(lead.created_at || Date.now()).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  )

  const KanbanColumn = ({ 
    column, 
    leads: columnLeads 
  }: { 
    column: typeof KANBAN_COLUMNS[0], 
    leads: Lead[] 
  }) => (
    <div className="notion-kanban-column">
      <div className="notion-column-header">
        <div className="notion-column-title">
          {column.icon}
          {column.title}
        </div>
        <div className="notion-column-count">
          {columnLeads.length}
        </div>
      </div>
      
      <div 
        className="notion-column-content"
        onDrop={(e) => {
          e.preventDefault()
          const leadId = e.dataTransfer.getData('text/plain')
          if (leadId) {
            handleDragEnd({
              active: { id: leadId },
              over: { id: column.id }
            } as any)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{ minHeight: '400px' }}
      >
        {columnLeads.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        
        {columnLeads.length === 0 && (
          <div className="notion-empty-state">
            <div className="notion-empty-icon">
              {column.icon}
            </div>
            <p className="notion-empty-text">
              Nenhum lead nesta etapa
            </p>
          </div>
        )}
        
        {onCreateLead && (
          <button 
            className="notion-add-btn"
            onClick={() => {
              setSelectedColumn(column.id)
              setIsQuickAddModalOpen(true)
            }}
          >
            <Plus style={{ width: '12px', height: '12px' }} />
            Adicionar
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* Área Principal - Sidebar removida (já existe no layout) */}
      <div className="w-full">
        {/* Toolbar minimalista */}
        <div className="notion-toolbar">
          <button 
            className="notion-btn notion-btn-primary"
            onClick={() => onCreateLead && onCreateLead({})}
          >
            <Plus style={{ width: '12px', height: '12px' }} />
            Novo
          </button>
          
          {onImport && (
            <button 
              className="notion-btn notion-btn-secondary"
              onClick={onImport}
            >
              <Upload style={{ width: '12px', height: '12px' }} />
              Import
            </button>
          )}
          
          {onExport && (
            <button 
              className="notion-btn notion-btn-secondary"
              onClick={onExport}
            >
              <Download style={{ width: '12px', height: '12px' }} />
              Export
            </button>
          )}
          
          {onAssignLeads && userRole === 'admin' && (
            <button 
              className="notion-btn notion-btn-secondary"
              onClick={onAssignLeads}
            >
              <UserCheck style={{ width: '12px', height: '12px' }} />
              Atribuir
            </button>
          )}
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="notion-kanban">
            {KANBAN_COLUMNS.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leadsByStatus[column.id] || []}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* Drag Overlay */}
      {draggedLead && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            pointerEvents: 'none',
            background: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Movendo: {draggedLead.name}
        </div>
      )}

      {/* Quick Add Lead Modal */}
      <QuickAddLeadModal
        isOpen={isQuickAddModalOpen}
        onClose={() => {
          setIsQuickAddModalOpen(false)
          setSelectedColumn(null)
        }}
        onSubmit={handleQuickAddLead}
        status={selectedColumn || ''}
        statusTitle={KANBAN_COLUMNS.find(col => col.id === selectedColumn)?.title || ''}
      />

      {/* Lead Detail Modal */}
      {selectedLead && (
        <OptimizedLeadModal
          lead={selectedLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedLead(null)
          }}
          currentUserId="admin" // TODO: Get actual current user ID
          onUpdate={onUpdateLead}
          onDelete={(leadId) => {}}
        />
      )}
    </div>
  )
}
