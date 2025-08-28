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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-1">
            Visão geral e gestão da equipe
          </p>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Crescimento Mensal</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                +{stats.monthlyGrowth}%
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Consultores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Equipe de Consultores
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {consultors.length} consultores ativos
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultors.map((consultor) => (
              <div
                key={consultor.id}
                className="flex items-center space-x-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {consultor.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{consultor.name}</p>
                  <p className="text-sm text-gray-600">{consultor.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pipeline Geral
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Visão completa de todos os leads
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserCheck className="w-4 h-4" />
              <span>Atribuir Leads</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <OptimizedKanbanBoard 
            leads={leads}
            currentUserId={currentUser.id}
            isAdmin={true}
          />
        </div>
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
