'use client'

import React, { useState } from 'react'
import { useConsultorDashboard } from '@/hooks/useConsultorDashboard'
import { OptimizedKanbanBoard } from './OptimizedKanbanBoard'
import { DashboardSkeleton } from './LazyComponents'
import { LeadExportModal } from './LeadExportModal'
import { Target, Calendar, Clock, TrendingUp, Download } from 'lucide-react'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface ConsultorDashboardProps {
  currentUser: UserProfile
}

export function ConsultorDashboard({ currentUser }: ConsultorDashboardProps) {
  const { leads, tasks, stats, isLoading, error } = useConsultorDashboard(currentUser.id)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  if (error) {
    console.error('Erro no dashboard consultor:', error)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header com Estatísticas - Estilo Notion */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="notion-title text-xl font-semibold text-gray-900">
              Dashboard do Consultor
            </h1>
            <p className="notion-body text-gray-500 mt-0.5 text-sm">
              Seus leads e performance individual
            </p>
          </div>
          
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
        
        {/* Estatísticas - Estilo Notion Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Meus Leads */}
          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Meus Leads</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">{stats.totalLeads}</p>
                <p className="notion-caption text-gray-400 mt-1">
                  {stats.activeLeads} ativos
                </p>
              </div>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Tarefas Pendentes */}
          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Tarefas Pendentes</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
                <p className="notion-caption text-gray-400 mt-1">
                  Para hoje
                </p>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Reuniões desta Semana */}
          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Reuniões</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">5</p>
                <p className="notion-caption text-gray-400 mt-1">
                  Esta semana
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Taxa de Conversão</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">{stats.conversionRate}%</p>
                <p className="notion-caption text-gray-400 mt-1">
                  Este mês
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>
      </div>

      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <OptimizedKanbanBoard 
          leads={leads}
          currentUserId={currentUser.id}
          isAdmin={false}
        />
      </div>

      {/* Modal de Exportação */}
      <LeadExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentUserId={currentUser.id}
        isAdmin={false}
      />
    </div>
  )
}