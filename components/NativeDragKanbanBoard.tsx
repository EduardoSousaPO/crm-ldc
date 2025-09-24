'use client'

import { useState, memo, useCallback, useMemo, useRef } from 'react'
import { UltraResponsiveKanbanColumn } from './UltraResponsiveKanbanColumn'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface NativeDragKanbanBoardProps {
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

const NativeDragKanbanBoard = memo(({ 
  leads, 
  onUpdateLead, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: NativeDragKanbanBoardProps) => {
  
  // Estados mínimos
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)
  
  // Refs para performance
  const updateInProgressRef = useRef<boolean>(false)

  // Memoização dos leads por coluna
  const leadsByColumn = useMemo(() => {
    const grouped = new Map<LeadStatus, Lead[]>()
    
    KANBAN_COLUMNS.forEach(column => {
      grouped.set(column.id, [])
    })
    
    leads.forEach(lead => {
      const columnLeads = grouped.get(lead.status as LeadStatus)
      if (columnLeads) {
        columnLeads.push(lead)
      }
    })
    
    return grouped
  }, [leads])

  // Handler para início do drag NATIVO
  const handleDragStart = useCallback((lead: Lead) => {
    setDraggedLead(lead)
    document.body.style.cursor = 'grabbing'
  }, [])

  // Handler para drag over NATIVO
  const handleDragOver = useCallback((columnId: LeadStatus) => {
    setDragOverColumn(columnId)
  }, [])

  // Handler para drag leave NATIVO
  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  // Handler para drop NATIVO - ULTRA RESPONSIVO
  const handleDrop = useCallback(async (columnId: LeadStatus) => {
    document.body.style.cursor = 'default'
    setDragOverColumn(null)
    
    if (!draggedLead || !onUpdateLead || updateInProgressRef.current) {
      setDraggedLead(null)
      return
    }

    // Verificar se mudou de status
    if (draggedLead.status === columnId) {
      setDraggedLead(null)
      return
    }

    // Prevenir múltiplas atualizações
    updateInProgressRef.current = true

    try {
      // Atualização instantânea
      await onUpdateLead(draggedLead.id, { status: columnId })
      
      const column = KANBAN_COLUMNS.find(col => col.id === columnId)
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
      setDraggedLead(null)
      updateInProgressRef.current = false
    }
  }, [draggedLead, onUpdateLead])

  // Handler para cancelar drag
  const handleDragEnd = useCallback(() => {
    document.body.style.cursor = 'default'
    setDraggedLead(null)
    setDragOverColumn(null)
  }, [])

  // Função para criar lead
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Kanban Board NATIVO - Máxima Performance */}
      <div className="flex-1 overflow-hidden">
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
      </div>

      {/* Custom Drag Overlay para feedback visual */}
      {draggedLead && (
        <div 
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-white rounded-lg p-4 border-2 border-blue-400 shadow-2xl transform rotate-2 scale-105 opacity-90">
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {draggedLead.name}
              </h4>
            </div>
            {draggedLead.email && (
              <div className="text-xs text-gray-600 mb-1">
                📧 {draggedLead.email}
              </div>
            )}
            <div className="text-xs text-blue-600 font-medium">
              Arrastando...
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

NativeDragKanbanBoard.displayName = 'NativeDragKanbanBoard'

export default NativeDragKanbanBoard
