'use client'

import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
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
  Filter,
  Search
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface KuveraKanbanBoardProps {
  leads: Lead[]
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>
  onCreateLead?: (leadData: Partial<Lead>) => Promise<void>
  userRole?: 'admin' | 'consultor'
}

const KANBAN_COLUMNS: Array<{
  id: LeadStatus
  title: string
  description: string
  color: string
  icon: React.ReactNode
}> = [
  {
    id: 'lead_qualificado',
    title: 'Leads Qualificados',
    description: 'Leads que passaram pela qualificação inicial',
    color: 'border-l-4 border-l-gray-400',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'reuniao_agendada',
    title: 'Reunião Agendada',
    description: 'Reuniões R1 marcadas com prospects',
    color: 'border-l-4 border-l-gray-600',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    id: 'proposta_apresentada',
    title: 'Proposta Apresentada',
    description: 'Propostas enviadas aguardando resposta',
    color: 'border-l-4 border-l-gray-700',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'cliente_ativo',
    title: 'Clientes Ativos',
    description: 'Clientes convertidos e ativos',
    color: 'border-l-4 border-l-black',
    icon: <TrendingUp className="w-5 h-5" />
  }
]

export function KuveraKanbanBoard({ 
  leads, 
  onUpdateLead, 
  onCreateLead,
  userRole = 'consultor' 
}: KuveraKanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const updateInProgressRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )

  // Filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  // Agrupar leads por status
  const leadsByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredLeads.filter(lead => lead.status === column.id)
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
      className="kuvera-card mb-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => {
        setSelectedLead(lead)
        setIsDetailModalOpen(true)
      }}
    >
      <div className="kuvera-card-header">
        <div className="flex items-start justify-between mb-2">
          <h4 className="kuvera-card-title text-sm">{lead.name}</h4>
          <div className="kuvera-badge kuvera-badge-secondary text-xs">
            {lead.score || 0}
          </div>
        </div>
        
        <div className="kuvera-space-y-2">
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-gray-500" />
              <span className="kuvera-body-sm truncate">{lead.email}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-gray-500" />
              <span className="kuvera-body-sm">{lead.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="kuvera-body-sm">
              {new Date(lead.created_at || Date.now()).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
      
      {lead.notes && (
        <div className="kuvera-card-content">
          <p className="kuvera-body-sm text-gray-600 line-clamp-2">
            {lead.notes}
          </p>
        </div>
      )}
      
      <div className="kuvera-card-footer">
        <span className="kuvera-body-sm text-gray-500">
          {lead.origin || 'Origem não informada'}
        </span>
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
    <div className="flex-1 min-w-80">
      <div className={`kuvera-card ${column.color} mb-4`}>
        <div className="kuvera-card-header">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {column.icon}
              <h3 className="kuvera-card-title">{column.title}</h3>
            </div>
            <div className="kuvera-badge kuvera-badge-primary">
              {columnLeads.length}
            </div>
          </div>
          <p className="kuvera-card-description text-sm">
            {column.description}
          </p>
        </div>
        
        {onCreateLead && (
          <div className="kuvera-card-footer">
            <button 
              className="kuvera-btn kuvera-btn-ghost w-full"
              onClick={() => {
                setSelectedColumn(column.id)
                setIsQuickAddModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar Lead
            </button>
          </div>
        )}
      </div>
      
      <div 
        className="min-h-96 p-4 bg-gray-50 rounded-lg"
        style={{ minHeight: '600px' }}
      >
        {columnLeads.map(lead => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', lead.id)
              setDraggedLead(lead)
            }}
          >
            <LeadCard lead={lead} />
          </div>
        ))}
        
        {columnLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {column.icon}
            </div>
            <p className="kuvera-body-sm text-gray-500">
              Nenhum lead nesta etapa
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="kuvera-container kuvera-section">
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              leads={leadsByStatus[column.id] || []}
            />
          ))}
        </div>
      </DndContext>

      {/* Drag Overlay */}
      {draggedLead && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <div className="kuvera-card bg-white shadow-lg">
            <div className="kuvera-card-header">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="kuvera-body font-medium">
                  Movendo: {draggedLead.name}
                </span>
              </div>
            </div>
          </div>
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
          currentUserId="user" // TODO: Get actual current user ID
          onUpdate={onUpdateLead}
          onDelete={(leadId) => {}}
        />
      )}
    </div>
  )
}
