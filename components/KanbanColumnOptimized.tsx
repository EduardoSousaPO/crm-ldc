'use client'

import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCardCompact } from './KanbanCardCompact'
import { Plus, Filter, MoreHorizontal } from 'lucide-react'
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

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-300/50 shadow-lg backdrop-blur-sm">
      {/* Header da Coluna */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-4 h-4 rounded-full ${color.replace('bg-', 'bg-')} flex-shrink-0 shadow-sm`}></div>
            <h3 className="font-bold text-gray-800 truncate text-sm">{title}</h3>
            <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full shadow-sm flex-shrink-0">
              {stats.total}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-3 truncate font-medium">{description}</p>
        
        {/* Estatísticas Rápidas */}
        <div className="flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center space-x-2 min-w-0">
            {stats.totalValue > 0 && (
              <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-2.5 py-1 rounded-full font-bold border border-blue-200/50 shadow-sm">
                R$ {(stats.totalValue / 1000).toFixed(0)}k
              </span>
            )}
            {stats.hotLeads > 0 && (
              <span className="bg-gradient-to-r from-red-50 to-rose-50 text-red-800 px-2.5 py-1 rounded-full font-bold border border-red-200/50 shadow-sm">
                {stats.hotLeads} quentes
              </span>
            )}
          </div>
          
          {onAddLead && (
            <button
              onClick={onAddLead}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 px-2.5 py-1 rounded-full hover:from-emerald-100 hover:to-green-100 transition-all text-xs font-bold border border-emerald-200/50 shadow-sm hover:shadow-md"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Cards */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 space-y-3 overflow-y-auto
          ${isOver ? 'bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400/60' : 'bg-gradient-to-b from-gray-50/50 to-slate-50/50'}
          transition-all duration-300 rounded-b-2xl
        `}
        style={{ minHeight: '500px' }}
      >
        <SortableContext items={sortedLeads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {sortedLeads.length > 0 ? (
            sortedLeads.map((lead) => (
              <KanbanCardCompact
                key={lead.id}
                lead={lead}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">Nenhum lead nesta fase</p>
              {onAddLead && (
                <button
                  onClick={onAddLead}
                  className="text-xs text-petroleum-600 hover:text-petroleum-700 transition-colors"
                >
                  Adicionar primeiro lead
                </button>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
})

KanbanColumnOptimized.displayName = 'KanbanColumnOptimized'

export { KanbanColumnOptimized }

