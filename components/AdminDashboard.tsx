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
      {/* Header com KPIs - Estilo Notion */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="notion-title text-xl font-semibold text-gray-900">
              Dashboard Administrativo
            </h1>
            <p className="notion-body text-gray-500 mt-0.5 text-sm">
              Visão geral e gestão da equipe
            </p>
          </div>
          
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Atribuir Leads</span>
          </button>
        </div>

        {/* KPIs Cards - Estilo Notion Minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Total de Leads</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">
                  {stats.totalLeads}
                </p>
              </div>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Consultores Ativos</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">
                  {stats.activeConsultors}
                </p>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Taxa de Conversão</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="card-minimal">
            <div className="flex items-center justify-between">
              <div>
                <p className="notion-caption text-gray-500 mb-1">Crescimento Mensal</p>
                <p className="notion-title text-2xl font-semibold text-gray-900">
                  +{stats.monthlyGrowth}%
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
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