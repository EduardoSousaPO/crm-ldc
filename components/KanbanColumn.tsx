'use client'

import { useDroppable } from '@dnd-kit/core'
import { LeadCard } from './LeadCard'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface KanbanColumnProps {
  id: LeadStatus
  title: string
  description: string
  color: string
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: any) => Promise<void>
  currentUserId: string
}

export function KanbanColumn({ 
  id, 
  title, 
  description, 
  color, 
  leads,
  onLeadUpdate,
  currentUserId 
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 transition-colors duration-200 ${
          isOver ? 'bg-gray-800/50 rounded-lg p-2' : ''
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
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">—</div>
            <p className="text-sm">Nenhum lead nesta fase</p>
          </div>
        )}
      </div>
    </div>
  )
}
