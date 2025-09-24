'use client'

import { memo, useCallback, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Mail, Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OptimizedLeadModal } from './OptimizedLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface VirtualizedLeadCardProps {
  lead: Lead
  currentUserId: string
  isDragging?: boolean
}

const VirtualizedLeadCard = memo(({ 
  lead, 
  currentUserId,
  isDragging = false 
}: VirtualizedLeadCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  // Draggable otimizado
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook,
  } = useDraggable({
    id: lead.id,
  })

  // Transform otimizado para performance
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDraggingFromHook ? 1000 : 'auto',
  } : undefined

  // Handler otimizado para clique
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevenir clique durante drag
    if (isDraggingFromHook) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setIsDetailModalOpen(true)
  }, [isDraggingFromHook])

  // Formatação otimizada da data
  const timeAgo = formatDistanceToNow(new Date(lead.updated_at || lead.created_at || Date.now()), { 
    addSuffix: true, 
    locale: ptBR 
  })

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          bg-white rounded-lg p-4 border border-gray-200 cursor-pointer 
          transition-all duration-150 ease-out select-none
          ${(isDragging || isDraggingFromHook) 
            ? 'shadow-lg border-blue-300 opacity-90' 
            : 'hover:border-gray-300 hover:shadow-sm'
          }
        `}
        onClick={handleClick}
        {...listeners}
        {...attributes}
      >
        {/* Nome do Lead */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
            {lead.name}
          </h4>
        </div>

        {/* Informações de Contato - Renderização Condicional Otimizada */}
        {(lead.email || lead.phone) && (
          <div className="space-y-2 mb-3">
            {lead.email && (
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{lead.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Minimalista */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{timeAgo}</span>
          {lead.score && lead.score > 0 && (
            <span className="text-xs font-medium text-gray-600 ml-2">
              {lead.score}
            </span>
          )}
        </div>
      </div>

      {/* Modal otimizado - apenas quando necessário */}
      {isDetailModalOpen && (
        <OptimizedLeadModal
          lead={lead}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          currentUserId={currentUserId}
          onUpdate={async () => {}} // Placeholder - será implementado se necessário
          onDelete={async () => {}} // Placeholder - será implementado se necessário
        />
      )}
    </>
  )
})

VirtualizedLeadCard.displayName = 'VirtualizedLeadCard'

export { VirtualizedLeadCard }
