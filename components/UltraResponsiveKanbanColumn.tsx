'use client'

import { memo, useCallback, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { LeadCard } from './LeadCard'
import { QuickAddLeadModal } from './QuickAddLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface UltraResponsiveKanbanColumnProps {
  id: LeadStatus
  title: string
  description: string
  leads: Lead[]
  onLeadCreate?: (leadData: any) => Promise<void>
  onLeadUpdate?: (leadId: string, updates: any) => Promise<void>
  currentUserId: string
}

const UltraResponsiveKanbanColumn = memo(({ 
  id, 
  title, 
  description, 
  leads,
  onLeadCreate,
  onLeadUpdate,
  currentUserId
}: UltraResponsiveKanbanColumnProps) => {
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)

  // Droppable ultra-otimizado
  const { setNodeRef, isOver } = useDroppable({
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
      {/* Header ultra-otimizado */}
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

      {/* Drop Zone Ultra-Responsiva */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 px-2 transition-colors duration-100
          ${isOver 
            ? 'bg-blue-50 rounded-lg border-2 border-dashed border-blue-300' 
            : ''
          }
        `}
      >
        {/* Lista de Leads Ultra-Otimizada */}
        <div className="space-y-2 h-full overflow-y-auto">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              currentUserId={currentUserId}
              onUpdate={onLeadUpdate}
            />
          ))}

          {/* Estado vazio ultra-otimizado */}
          {leads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              {isOver ? (
                <>
                  <div className="text-2xl mb-2 animate-bounce">🎯</div>
                  <p className="text-sm font-medium">Solte aqui!</p>
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

      {/* Modal ultra-otimizado */}
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

UltraResponsiveKanbanColumn.displayName = 'UltraResponsiveKanbanColumn'

export { UltraResponsiveKanbanColumn }
