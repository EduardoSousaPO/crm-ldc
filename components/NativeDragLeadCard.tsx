'use client'

import { memo, useCallback, useState, useRef } from 'react'
import { Mail, Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OptimizedLeadModal } from './OptimizedLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface NativeDragLeadCardProps {
  lead: Lead
  currentUserId: string
  onDragStart: (lead: Lead) => void
  onDragEnd: () => void
  isBeingDragged: boolean
}

const NativeDragLeadCard = memo(({ 
  lead, 
  currentUserId,
  onDragStart,
  onDragEnd,
  isBeingDragged
}: NativeDragLeadCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  
  // Handler para início do drag NATIVO
  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    // Configurar dados do drag
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
    
    // Criar imagem de drag customizada (opcional)
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(2deg) scale(1.05)'
    dragImage.style.opacity = '0.8'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 140, 50)
    
    // Remover imagem após um tempo
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
    
    onDragStart(lead)
  }, [lead, onDragStart])

  // Handler para fim do drag NATIVO
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd()
  }, [onDragEnd])

  // Handler otimizado para clique
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Prevenir clique durante ou logo após drag
    if (isDragging || isBeingDragged) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    // Verificar se foi um clique real ou resultado de drag
    const timeSinceMouseDown = Date.now() - (e.timeStamp || 0)
    if (timeSinceMouseDown > 200) { // Se passou mais de 200ms, pode ser drag
      return
    }
    
    setIsDetailModalOpen(true)
  }, [isDragging, isBeingDragged])

  // Formatação da data
  const timeAgo = formatDistanceToNow(new Date(lead.updated_at || lead.created_at || Date.now()), { 
    addSuffix: true, 
    locale: ptBR 
  })

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
          bg-white rounded-lg p-4 border border-gray-200 cursor-pointer 
          select-none touch-manipulation transition-all duration-150
          ${isDragging || isBeingDragged
            ? 'opacity-50 shadow-lg border-blue-300 transform scale-105' 
            : 'hover:border-gray-300 hover:shadow-sm active:scale-95'
          }
        `}
        onClick={handleClick}
        style={{
          willChange: 'transform, opacity',
        }}
      >
        {/* Nome do Lead */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
            {lead.name}
          </h4>
        </div>

        {/* Informações de Contato */}
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

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{timeAgo}</span>
          {lead.score && lead.score > 0 && (
            <span className="text-xs font-medium text-gray-600 ml-2">
              {lead.score}
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {isDetailModalOpen && (
        <OptimizedLeadModal
          lead={lead}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          currentUserId={currentUserId}
          onUpdate={async () => {}}
          onDelete={async () => {}}
        />
      )}
    </>
  )
})

NativeDragLeadCard.displayName = 'NativeDragLeadCard'

export { NativeDragLeadCard }
