'use client'

import React, { useState } from 'react'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'
import { NotionKanbanBoard } from './NotionKanbanBoard'
import { LoadingSpinner } from './LoadingSpinner'
import { LeadAssignmentModal } from './LeadAssignmentModal'
import { LeadImportModal } from './LeadImportModal'
import { LeadExportModal } from './LeadExportModal'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']
type Lead = Database['public']['Tables']['leads']['Row']

interface AdminDashboardProps {
  currentUser: UserProfile
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const { leads, consultors, stats, isLoading, error } = useAdminDashboard()
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
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
      await queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
      
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
      await queryClient.invalidateQueries({ queryKey: ['admin-leads'] })
      
      toast.success('Lead criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead')
      throw error
    }
  }

  if (error) {
    console.error('Erro no dashboard admin:', error)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <NotionKanbanBoard
        leads={leads}
        onUpdateLead={handleUpdateLead}
        onCreateLead={handleCreateLead}
        userRole="admin"
        userName={currentUser.name || currentUser.email || 'Admin'}
        onImport={() => setIsImportModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onAssignLeads={() => setIsAssignmentModalOpen(true)}
      />

      {/* Modal de Atribuição */}
      <LeadAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role || 'admin'}
      />

      {/* Modal de Importação */}
      <LeadImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {}}
        currentUserId={currentUser.id}
        isAdmin={true}
      />

      {/* Modal de Exportação */}
      <LeadExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentUserId={currentUser.id}
        isAdmin={true}
      />
    </>
  )
}