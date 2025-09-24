'use client'

import { memo, useCallback, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { VirtualizedLeadCard } from './VirtualizedLeadCard'
import { QuickAddLeadModal } from './QuickAddLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface HighPerformanceKanbanColumnProps {
  id: LeadStatus
  title: string
  description: string
  leads: Lead[]
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isOver?: boolean
}

const HighPerformanceKanbanColumn = memo(({ 
  id, 
  title, 
  description, 
  leads,
  onLeadCreate,
  currentUserId,
  isOver = false
}: HighPerformanceKanbanColumnProps) => {
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)

  // Droppable otimizado
  const { setNodeRef } = useDroppable({
    id: id,
  })

  // Handler otimizado para criação de leads
  const handleQuickAdd = useCallback(async (leadData: any) => {
    if (onLeadCreate) {
      await onLeadCreate({
        ...leadData,
        status: id, // Status específico da coluna
      })
    }
    setIsQuickAddModalOpen(false)
  }, [onLeadCreate, id])

  return (
    <div className="flex flex-col w-80 h-full">
      {/* Header otimizado */}
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
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-150"
          title={`Adicionar lead em ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Drop Zone Ultra-Performática */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-2 transition-colors duration-150 ${
          isOver 
            ? 'bg-blue-50 rounded-lg' 
            : ''
        }`}
      >
        {/* Lista Virtualizada de Leads */}
        <div className="space-y-2 h-full overflow-y-auto">
          {leads.map((lead) => (
            <VirtualizedLeadCard
              key={lead.id}
              lead={lead}
              currentUserId={currentUserId}
            />
          ))}

          {/* Estado vazio otimizado */}
          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              {isOver ? (
                <>
                  <div className="text-2xl mb-2 animate-bounce">📋</div>
                  <p className="text-sm">Solte aqui</p>
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

      {/* Modal otimizado */}
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

HighPerformanceKanbanColumn.displayName = 'HighPerformanceKanbanColumn'

export { HighPerformanceKanbanColumn }



