'use client'

import React, { useState } from 'react'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { OptimizedKanbanBoard } from './OptimizedKanbanBoard'
import { DashboardSkeleton } from './LazyComponents'
import { LeadAssignmentModal } from './LeadAssignmentModal'
import { Users, TrendingUp, Calendar, Target, UserCheck, Settings } from 'lucide-react'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']
type Lead = Database['public']['Tables']['leads']['Row']

interface AdminDashboardProps {
  currentUser: UserProfile
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const { leads, consultors, stats, isLoading, error } = useAdminDashboard()
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)

  if (error) {
    console.error('Erro no dashboard admin:', error)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header com KPIs */}
      <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Visão geral e gestão da equipe
            </p>
          </div>
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <UserCheck className="w-4 h-4" />
            <span>Atribuir Leads</span>
          </button>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.totalLeads}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultores Ativos</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.activeConsultors}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.conversionRate}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 shadow-md border border-gray-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crescimento Mensal</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  +{stats.monthlyGrowth}%
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Section */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <OptimizedKanbanBoard 
          leads={leads}
          currentUserId={currentUser.id}
          isAdmin={true}
        />
      </div>

      {/* Modal de Atribuição */}
      <LeadAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role || 'admin'}
        onLeadAssigned={() => {
          // Recarregar dados após atribuição
          window.location.reload()
        }}
      />
    </div>
  )
}