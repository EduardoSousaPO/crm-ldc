'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { LeadCard } from './LeadCard'
import { QuickAddLeadModal } from './QuickAddLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface KanbanColumnProps {
  id: LeadStatus
  title: string
  description: string
  color: string
  bgColor?: string
  textColor?: string
  phase?: string
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
}

export function KanbanColumn({ 
  id, 
  title, 
  description, 
  color, 
  bgColor,
  textColor,
  phase,
  leads,
  onLeadUpdate,
  onLeadCreate,
  currentUserId 
}: KanbanColumnProps) {
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false)
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  })

  const handleQuickAdd = async (leadData: any) => {
    if (onLeadCreate) {
      await onLeadCreate(leadData)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column Header - Estilo Notion */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">
            {title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
        <button
          onClick={() => setIsQuickAddModalOpen(true)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title={`Adicionar lead em ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Drop Zone - Estilo Notion */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 px-2 transition-all duration-200 ${
          isOver 
            ? 'bg-gray-100 rounded-lg border-2 border-dashed border-gray-300' 
            : ''
        }`}
      >
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onUpdate={onLeadUpdate}
            currentUserId={currentUserId}
          />
        ))}

        {leads.length === 0 && (
          <div className="text-center py-12">
            {isOver ? (
              <div className="text-gray-600">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">Solte o lead aqui</p>
              </div>
            ) : (
              <div className="text-gray-400">
                <div className="text-2xl mb-2">○</div>
                <p className="text-sm mb-3">Nenhum lead</p>
                <button
                  onClick={() => setIsQuickAddModalOpen(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Adicionar lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      <QuickAddLeadModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onSubmit={handleQuickAdd}
        status={id}
        statusTitle={title}
      />
    </div>
  )
}
