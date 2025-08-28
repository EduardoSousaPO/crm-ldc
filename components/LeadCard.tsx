'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  MoreVertical,
  Star,
  Clock,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LeadDetailModal } from './LeadDetailModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadCardProps {
  lead: Lead
  isDragging?: boolean
  onUpdate?: (leadId: string, updates: any) => Promise<void>
  currentUserId: string
}

export function LeadCard({ lead, isDragging = false, onUpdate, currentUserId }: LeadCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook,
  } = useDraggable({
    id: lead.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10'
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10'
    if (score >= 40) return 'text-orange-400 bg-orange-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  const getOriginIcon = (origin: string) => {
    switch (origin?.toLowerCase()) {
      case 'website':
        return '🌐'
      case 'indicacao':
        return '👥'
      case 'linkedin':
        return '💼'
      case 'whatsapp':
        return '💬'
      default:
        return '📍'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging || isDraggingFromHook ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-white text-sm mb-1 line-clamp-1">
            {lead.name}
          </h4>
          <div className="flex items-center space-x-2">
            {lead.origin && (
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <span>{getOriginIcon(lead.origin)}</span>
                <span className="capitalize">{lead.origin}</span>
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        {lead.score !== null && lead.score > 0 && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
            {lead.score}
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        {lead.email && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        
        {lead.phone && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {lead.notes && (
        <div className="mb-3">
          <p className="text-xs text-gray-300 line-clamp-2 bg-gray-800/50 p-2 rounded">
            {lead.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(lead.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Action Buttons */}
          <button
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implementar ação rápida de mensagem
            }}
          >
            <MessageSquare className="w-3 h-3 text-gray-400" />
          </button>
          
          <button
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implementar ação rápida de agendamento
            }}
          >
            <Calendar className="w-3 h-3 text-gray-400" />
          </button>

          <button
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
          >
            <MoreVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quick Actions Menu */}
      {isMenuOpen && (
        <div className="absolute top-0 right-0 mt-8 mr-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
          <button
            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
            onClick={() => {
              setIsDetailModalOpen(true)
              setIsMenuOpen(false)
            }}
          >
            <Eye className="w-4 h-4" />
            <span>Ver detalhes</span>
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={() => {
              // TODO: Implementar edição de lead
              setIsMenuOpen(false)
            }}
          >
            Editar
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={() => {
              // TODO: Implementar adição de nota
              setIsMenuOpen(false)
            }}
          >
            Adicionar nota
          </button>
          <hr className="my-1 border-gray-700" />
          <button
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors"
            onClick={() => {
              // TODO: Implementar arquivamento/exclusão
              setIsMenuOpen(false)
            }}
          >
            Arquivar
          </button>
        </div>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={lead}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        currentUserId={currentUserId}
      />
    </div>
  )
}
