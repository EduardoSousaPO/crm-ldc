'use client'

import { memo, useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { LeadCard } from './LeadCard'
import { QuickAddLeadModal } from './QuickAddLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface NativeDragKanbanColumnProps {
  id: LeadStatus
  title: string
  description: string
  leads: Lead[]
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  onDragStart: (lead: Lead) => void
  onDragOver: (columnId: LeadStatus) => void
  onDragLeave: () => void
  onDrop: (columnId: LeadStatus) => void
  onDragEnd: () => void
  isDragOver: boolean
  draggedLead: Lead | null
}

const NativeDragKanbanColumn = memo(({ 
  id, 
  title, 
  description, 
  leads,
  onLeadCreate,
  currentUserId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragOver,
  draggedLead
}: NativeDragKanbanColumnProps) => {
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)

  // Handler para criação de leads
  const handleQuickAdd = useCallback(async (leadData: any) => {
    if (onLeadCreate) {
      await onLeadCreate({
        ...leadData,
        status: id,
      })
    }
    setIsQuickAddModalOpen(false)
  }, [onLeadCreate, id])

  // Handlers nativos de drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault() // Permitir drop
    onDragOver(id)
  }, [onDragOver, id])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Verificar se realmente saiu da coluna
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const { clientX, clientY } = e
    
    if (clientX < rect.left || clientX > rect.right || 
        clientY < rect.top || clientY > rect.bottom) {
      onDragLeave()
    }
  }, [onDragLeave])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onDrop(id)
  }, [onDrop, id])

  return (
    <div className="flex flex-col w-80 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">
            {title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {leads.length}
          </span>
        </div>
        <button
          onClick={() => setIsQuickAddModalOpen(true)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-100"
          title={`Adicionar lead em ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Drop Zone NATIVO */}
      <div
        className={`
          flex-1 px-2 transition-all duration-150
          ${isDragOver 
            ? 'bg-blue-50 rounded-lg border-2 border-dashed border-blue-400 scale-105' 
            : ''
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Lista de Leads */}
        <div className="space-y-2 h-full overflow-y-auto">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              currentUserId={currentUserId}
            />
          ))}

          {/* Estado vazio */}
          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              {isDragOver ? (
                <>
                  <div className="text-3xl mb-2 animate-bounce">🎯</div>
                  <p className="text-sm font-medium text-blue-600">Solte aqui!</p>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-2">○</div>
                  <p className="text-sm mb-2">Nenhum lead</p>
                  <button
                    onClick={() => setIsQuickAddModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Adicionar lead
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <QuickAddLeadModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onSubmit={handleQuickAdd}
        status={id}
        statusTitle={title}
      />
    </div>
  )
})

NativeDragKanbanColumn.displayName = 'NativeDragKanbanColumn'

export { NativeDragKanbanColumn }
