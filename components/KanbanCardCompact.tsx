'use client'

import { useState, memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Star,
  MessageCircle
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
  const [isExpanded, setIsExpanded] = useState(false)
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

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    const colors = {
      'lead_qualificado': 'bg-blue-50 border-blue-200 text-blue-700',
      'contato_inicial': 'bg-purple-50 border-purple-200 text-purple-700',
      'reuniao_agendada': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'proposta_enviada': 'bg-amber-50 border-amber-200 text-amber-700',
      'negociacao': 'bg-orange-50 border-orange-200 text-orange-700',
      'convertido': 'bg-green-50 border-green-200 text-green-700',
      'perdido': 'bg-gray-50 border-gray-200 text-gray-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-700'
  }

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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          group bg-white rounded-lg border shadow-sm transition-all duration-200 cursor-pointer
          ${isDragging ? 'shadow-xl rotate-1 scale-105 z-50 border-blue-300' : 'hover:shadow-md hover:border-gray-300 hover:scale-[1.01]'}
          border-gray-200
        `}
      >
        {/* Header Compacto */}
        <div className="p-2.5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {lead.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {lead.email}
              </p>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <PriorityIcon className={`w-3 h-3 ${priority.color}`} />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Informações Essenciais - Sempre Visíveis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {lead.phone && (
                <div className="flex items-center text-xs text-gray-500">
                  <Phone className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{lead.phone.slice(-4)}</span>
                </div>
              )}
              
              {lead.score && lead.score > 0 && (
                <div className="flex items-center text-xs text-blue-600 font-medium">
                  <span>Score: {lead.score}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400">
              {new Date(lead.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Seção Expandida - Progressive Disclosure */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="space-y-2">
              {/* Contato */}
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-2 text-gray-400" />
                <span className="truncate">{lead.email}</span>
              </div>

              {/* Data de Criação */}
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Observações (se houver) */}
              {lead.notes && (
                <div className="flex items-start text-xs text-gray-600">
                  <MessageCircle className="w-3 h-3 mr-2 text-gray-400 mt-0.5" />
                  <span className="line-clamp-2">{lead.notes}</span>
                </div>
              )}

              {/* Ações Rápidas */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {priority.label}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetailModal(true)
                  }}
                  className="text-xs text-petroleum-600 hover:text-petroleum-700 font-medium"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de Atividade Recente */}
        <div className="absolute top-2 right-2">
          {lead.updated_at && new Date(lead.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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

