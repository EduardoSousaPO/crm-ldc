'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, Target } from 'lucide-react'

interface DragFeedbackProps {
  isDragging: boolean
  leadName: string
}

export function DragFeedback({ isDragging, leadName }: DragFeedbackProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white/95 backdrop-blur-sm border border-blue-200 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{leadName}</span>
              <ArrowDown className="w-4 h-4 text-gray-400 animate-bounce" />
              <span className="text-gray-500">Solte em uma coluna</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
