'use client'

import React from 'react'
import { useConsultorDashboard } from '@/hooks/useConsultorDashboard'
import { OptimizedKanbanBoard } from './OptimizedKanbanBoard'
import { DashboardSkeleton } from './LazyComponents'
import { Target, Calendar, Clock, TrendingUp } from 'lucide-react'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface ConsultorDashboardProps {
  currentUser: UserProfile
}

export function ConsultorDashboard({ currentUser }: ConsultorDashboardProps) {
  const { leads, tasks, stats, isLoading, error } = useConsultorDashboard(currentUser.id)

  if (error) {
    console.error('Erro no dashboard consultor:', error)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header com Estatísticas */}
      <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard do Consultor
          </h1>
          <p className="text-gray-600 mt-1">
            Seus leads e performance individual
          </p>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meus Leads */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Meus Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {stats.activeLeads} ativos
            </p>
          </div>
        </div>

        {/* Tarefas Pendentes */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tarefas Pendentes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingTasks}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Para hoje
            </p>
          </div>
        </div>

        {/* Reuniões desta Semana */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reuniões</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Esta semana
            </p>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.conversionRate}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Este mês
            </p>
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
    </div>
  )
}