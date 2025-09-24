'use client'

import { useState, memo } from 'react'
import UltraResponsiveKanbanBoard from './UltraResponsiveKanbanBoard'
import NativeDragKanbanBoard from './NativeDragKanbanBoard'
import { Settings, Zap, Code } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface DragDropTestSuiteProps {
  leads: Lead[]
  onUpdateLead?: (leadId: string, updates: any) => Promise<void>
  onLeadCreate?: (leadData: any) => Promise<void>
  currentUserId: string
  isAdmin?: boolean
}

type DragDropVersion = 'ultra-responsive' | 'native' | 'auto'

const DragDropTestSuite = memo(({ 
  leads, 
  onUpdateLead, 
  onLeadCreate, 
  currentUserId, 
  isAdmin = false 
}: DragDropTestSuiteProps) => {
  
  const [selectedVersion, setSelectedVersion] = useState<DragDropVersion>('ultra-responsive')
  const [showVersionSelector, setShowVersionSelector] = useState(true)

  // Auto-detectar melhor versão baseada no número de leads e performance
  const getRecommendedVersion = (): DragDropVersion => {
    if (leads.length > 50) {
      return 'native' // Para muitos leads, nativo é mais performático
    }
    return 'ultra-responsive' // Para poucos leads, dnd-kit otimizado é melhor
  }

  const renderKanbanBoard = () => {
    const version = selectedVersion === 'auto' ? getRecommendedVersion() : selectedVersion

    switch (version) {
      case 'native':
        return (
          <NativeDragKanbanBoard
            leads={leads}
            onUpdateLead={onUpdateLead}
            onLeadCreate={onLeadCreate}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        )
      case 'ultra-responsive':
      default:
        return (
          <UltraResponsiveKanbanBoard
            leads={leads}
            onUpdateLead={onUpdateLead}
            onLeadCreate={onLeadCreate}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Version Selector */}
      {showVersionSelector && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Teste de Performance Drag & Drop
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-yellow-700">Versão:</label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value as DragDropVersion)}
                  className="text-sm border border-yellow-300 rounded px-2 py-1 bg-white"
                >
                  <option value="ultra-responsive">
                    🚀 Ultra-Responsivo (dnd-kit otimizado)
                  </option>
                  <option value="native">
                    ⚡ Nativo HTML5 (máxima performance)
                  </option>
                  <option value="auto">
                    🤖 Automático (recomendado)
                  </option>
                </select>
              </div>

              <div className="text-xs text-yellow-600">
                {leads.length} leads • Recomendado: {getRecommendedVersion() === 'native' ? 'Nativo' : 'Ultra-Responsivo'}
              </div>
            </div>

            <button
              onClick={() => setShowVersionSelector(false)}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              Ocultar
            </button>
          </div>

          {/* Performance Tips */}
          <div className="mt-2 text-xs text-yellow-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Ultra-Responsivo: Melhor para &lt;50 leads, animações suaves</span>
              </div>
              <div className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                <span>Nativo: Melhor para 50+ leads, máxima performance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {renderKanbanBoard()}
      </div>

      {/* Performance Indicator */}
      {!showVersionSelector && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowVersionSelector(true)}
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          >
            {selectedVersion === 'auto' ? getRecommendedVersion() : selectedVersion}
          </button>
        </div>
      )}
    </div>
  )
})

DragDropTestSuite.displayName = 'DragDropTestSuite'

export default DragDropTestSuite
