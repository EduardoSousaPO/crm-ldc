'use client'

import React, { useState } from 'react'
import { useConsultorDashboard } from '@/hooks/useConsultorDashboard'
import UltraResponsiveKanbanBoard from './UltraResponsiveKanbanBoard'
import { LoadingSpinner } from './LoadingSpinner'
import { LeadExportModal } from './LeadExportModal'
import { Target, Calendar, Clock, TrendingUp, Download } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface ConsultorDashboardProps {
  currentUser: UserProfile
}

export function ConsultorDashboard({ currentUser }: ConsultorDashboardProps) {
  const { leads, tasks, stats, isLoading, error } = useConsultorDashboard(currentUser.id)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Função para atualizar lead
  const handleUpdateLead = async (leadId: string, updates: any) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar lead')
      }

      // Invalidar queries para recarregar dados
      await queryClient.invalidateQueries({ queryKey: ['consultor-leads', currentUser.id] })
      
      toast.success('Lead atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast.error('Erro ao atualizar lead')
      throw error
    }
  }

  // Função para criar lead
  const handleCreateLead = async (leadData: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          consultant_id: currentUser.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar lead')
      }

      // Invalidar queries para recarregar dados
      await queryClient.invalidateQueries({ queryKey: ['consultor-leads', currentUser.id] })
      
      toast.success('Lead criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead')
      throw error
    }
  }

  if (error) {
    console.error('Erro no dashboard consultor:', error)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toolbar minimalista */}
      <div className="flex-shrink-0 p-4 bg-white">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <UltraResponsiveKanbanBoard 
          leads={leads}
          onUpdateLead={handleUpdateLead}
          onLeadCreate={handleCreateLead}
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