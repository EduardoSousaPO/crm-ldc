'use client'

import { useState, memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Clock,
  Star,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react'
import { LeadDetailModal } from './LeadDetailModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface KanbanCardCompactProps {
  lead: Lead
  currentUserId: string
  isAdmin?: boolean
}

const KanbanCardCompact = memo(({ lead, currentUserId, isAdmin = false }: KanbanCardCompactProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  // Função para calcular prioridade visual
  const getPriorityIndicator = (lead: Lead) => {
    const score = lead.score || 0
    const isHot = score > 80
    const isWarm = score > 50
    
    if (isHot) return { color: 'text-red-500', icon: Star, label: 'Quente' }
    if (isWarm) return { color: 'text-amber-500', icon: Clock, label: 'Morno' }
    return { color: 'text-gray-400', icon: User, label: 'Frio' }
  }

  const priority = getPriorityIndicator(lead)
  const PriorityIcon = priority.icon

  // Formatação de data mais limpa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays}d atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetailModal(true)}
        className={`
          group cursor-pointer bg-white rounded-md border border-gray-200 p-3 
          transition-all duration-150 hover:shadow-sm hover:border-gray-300
          ${isDragging ? 'shadow-lg rotate-2 scale-105' : ''}
        `}
      >
        {/* Header do Card - Nome e Ações */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="notion-subtitle font-medium text-gray-900 truncate">
              {lead.name}
            </h4>
            {lead.email && (
              <p className="notion-caption text-gray-500 truncate mt-0.5">
                {lead.email}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <PriorityIcon className={`w-3 h-3 ${priority.color}`} />
            <button className="p-1 hover:bg-gray-100 rounded-sm transition-colors">
              <MoreHorizontal className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="space-y-1.5">
          {/* Telefone */}
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}

          {/* Score e Data */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {lead.score && lead.score > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded text-xs font-medium
                  ${lead.score > 80 ? 'bg-red-50 text-red-600' : 
                    lead.score > 50 ? 'bg-amber-50 text-amber-600' : 
                    'bg-gray-50 text-gray-600'}
                `}>
                  {lead.score}
                </span>
              )}
            </div>
            
            <span className="notion-caption text-gray-400">
              {formatDate(lead.updated_at)}
            </span>
          </div>

          {/* Tags/Status (se houver) */}
          {lead.notes && (
            <div className="flex items-center gap-1 mt-2">
              <MessageCircle className="w-3 h-3 text-gray-400" />
              <span className="notion-caption text-gray-500 truncate">
                {lead.notes.substring(0, 30)}...
              </span>
            </div>
          )}
        </div>

        {/* Footer com indicadores sutis */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {/* Indicador de atividade recente */}
            <div className={`w-1.5 h-1.5 rounded-full ${
              new Date(lead.updated_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 
                ? 'bg-green-400' 
                : 'bg-gray-300'
            }`} />
            <span className="notion-caption text-gray-400">
              {priority.label}
            </span>
          </div>

          {/* Consultor responsável (se admin) */}
          {isAdmin && lead.consultant_id && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              <span className="notion-caption text-gray-500">
                {lead.consultant_id.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetailModal && (
        <LeadDetailModal
          lead={lead}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  )
})

KanbanCardCompact.displayName = 'KanbanCardCompact'

export { KanbanCardCompact }