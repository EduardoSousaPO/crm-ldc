'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { OptimizedLeadModal } from './OptimizedLeadModal'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface ModernLeadCardProps {
  lead: Lead
  isDragging?: boolean
  onUpdate?: (leadId: string, updates: any) => Promise<void>
  onDelete?: (leadId: string) => Promise<void>
  currentUserId: string
}

export function ModernLeadCard({ 
  lead, 
  isDragging = false, 
  onUpdate, 
  onDelete,
  currentUserId 
}: ModernLeadCardProps) {
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
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'text-orange-700 bg-orange-50 border-orange-200'
    return 'text-red-700 bg-red-50 border-red-200'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDetailModalOpen(true)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDetailModalOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete && confirm(`Tem certeza que deseja excluir o lead ${lead.name}?`)) {
      await onDelete(lead.id)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: isDragging || isDraggingFromHook ? 1 : 1.01 }}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        className={cn(
          "bg-white rounded-lg p-4 border border-gray-200 cursor-pointer transition-all duration-200 group relative",
          (isDragging || isDraggingFromHook) && "shadow-lg border-gray-300 z-50",
          !isDragging && !isDraggingFromHook && "hover:border-gray-300 hover:shadow-sm"
        )}
        onClick={handleClick}
        {...listeners}
        {...attributes}
        ref={setNodeRef}
        style={style}
      >
        {/* Nome do Lead - Estilo Notion */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-900 leading-tight">
            {lead.name}
          </h4>
        </div>

        {/* Informações Principais */}
        <div className="space-y-2 mb-3">
          {lead.email && (
            <div className="flex items-center text-xs text-gray-600">
              <Mail className="w-3 h-3 mr-2 text-gray-400" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="w-3 h-3 mr-2 text-gray-400" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Footer Simples */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {formatDistanceToNow(new Date(lead.updated_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
          {lead.score && (
            <span className="text-xs font-medium text-gray-600">
              {lead.score}
            </span>
          )}
        </div>
      </motion.div>

      {/* Modal de detalhes do lead */}
      <OptimizedLeadModal
        lead={lead}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        currentUserId={currentUserId}
      />
    </>
  )
}
