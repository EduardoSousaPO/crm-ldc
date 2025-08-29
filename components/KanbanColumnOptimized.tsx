'use client'

import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCardCompact } from './KanbanCardCompact'
import { Plus, MoreHorizontal } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadStatus = Database['public']['Enums']['lead_status']

interface KanbanColumnOptimizedProps {
  id: LeadStatus
  title: string
  description: string
  color: string
  leads: Lead[]
  currentUserId: string
  isAdmin?: boolean
  onAddLead?: () => void
}

const KanbanColumnOptimized = memo(({ 
  id, 
  title, 
  description, 
  color, 
  leads, 
  currentUserId, 
  isAdmin = false,
  onAddLead 
}: KanbanColumnOptimizedProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  // Memoizar leads ordenados por prioridade
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      // Priorizar por score (maior primeiro)
      const scoreA = a.score || 0
      const scoreB = b.score || 0
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      
      // Depois por data de atualização (mais recente primeiro)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [leads])

  // Calcular estatísticas da coluna
  const stats = useMemo(() => {
    const total = leads.length
    const totalValue = leads.reduce((sum, lead) => sum + (lead.score || 0), 0)
    const hotLeads = leads.filter(lead => (lead.score || 0) > 80).length
    
    return { total, totalValue, hotLeads }
  }, [leads])

  // Cores do status no estilo Notion
  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      'lead_qualification': '#6B7280', // Gray
      'initial_contact': '#8B5CF6',    // Purple  
      'meeting_scheduled': '#3B82F6',  // Blue
      'discovery_call': '#06B6D4',    // Cyan
      'proposal_sent': '#F59E0B',     // Amber
      'negotiation': '#EF4444',       // Red
      'client': '#10B981'             // Green
    }
    return (colors as any)[status] || '#6B7280'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header da Coluna - Estilo Notion Minimalista */}
      <div className="flex-shrink-0 mb-3 px-2">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(id) }}
              />
              <h3 className="notion-subtitle font-medium text-gray-700 text-sm">{title}</h3>
            </div>
            <span className="notion-caption bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">
              {stats.total}
            </span>
          </div>
          
          <button className="p-1 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Área de Drop - Estilo Notion */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-lg p-2 transition-all duration-150 min-h-[500px]
          ${isOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'bg-gray-50/30'}
        `}
        style={{ backgroundColor: isOver ? '#eff6ff' : '#f7f6f3' }}
      >
        <SortableContext items={sortedLeads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sortedLeads.map((lead) => (
              <KanbanCardCompact
                key={lead.id}
                lead={lead}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            ))}
            
            {/* Botão Add Lead - Estilo Notion */}
            {onAddLead && (
              <button
                onClick={onAddLead}
                className="w-full p-2 text-left text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-md transition-all duration-150 border-2 border-dashed border-gray-200 hover:border-gray-300 group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3" />
                  <span className="text-sm">Adicionar lead</span>
                </div>
              </button>
            )}
            
            {/* Empty State - Estilo Notion */}
            {sortedLeads.length === 0 && !onAddLead && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(id) }}
                  />
                </div>
                <p className="notion-caption text-gray-400">Nenhum lead nesta fase</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
})

KanbanColumnOptimized.displayName = 'KanbanColumnOptimized'

export { KanbanColumnOptimized }