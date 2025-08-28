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
    <div className="space-y-6 p-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Meus Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

      {/* Kanban Board */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Pipeline de Vendas
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Gerencie seus leads e oportunidades
          </p>
        </div>
        <div className="p-6">
          <OptimizedKanbanBoard 
            leads={leads}
            currentUserId={currentUser.id}
            isAdmin={false}
          />
        </div>
      </div>
    </div>
  )
}