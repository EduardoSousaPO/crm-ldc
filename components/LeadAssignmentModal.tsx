'use client'

import { useState, useEffect } from 'react'
import { X, UserCheck, Users, ArrowRight } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type UserProfile = Database['public']['Tables']['users']['Row']

interface LeadAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  currentUserRole: string
  onLeadAssigned?: () => void
}

export function LeadAssignmentModal({ 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserRole,
  onLeadAssigned 
}: LeadAssignmentModalProps) {
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([])
  const [consultors, setConsultors] = useState<UserProfile[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedConsultor, setSelectedConsultor] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const supabase = createSupabaseClient()

  // Apenas admins e SDR podem acessar
  const canAssign = currentUserRole === 'admin' || currentUserRole === 'sdr'

  useEffect(() => {
    if (isOpen && canAssign) {
      fetchData()
    }
  }, [isOpen, canAssign])

  const fetchData = async () => {
    setIsLoading(true)
    
    try {
      // Buscar leads não atribuídos ou com status inicial
      const { data: leads, error: leadsError } = await (supabase as any)
        .from('leads')
        .select('*')
        .or('consultant_id.is.null,status.eq.lead_qualificado')
        .order('created_at', { ascending: false })

      if (leadsError) {
        console.error('Erro ao buscar leads:', leadsError)
      } else {
        setUnassignedLeads(leads || [])
      }

      // Buscar consultores
      const { data: consultorsData, error: consultorsError } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('role', 'consultor')
        .order('name', { ascending: true })

      if (consultorsError) {
        console.error('Erro ao buscar consultores:', consultorsError)
      } else {
        setConsultors(consultorsData || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeadSelection = (leadId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads(prev => [...prev, leadId])
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId))
    }
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === unassignedLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(unassignedLeads.map(lead => lead.id))
    }
  }

  const handleAssignLeads = async () => {
    if (selectedLeads.length === 0 || !selectedConsultor) {
      toast.error('Selecione leads e um consultor')
      return
    }

    setIsAssigning(true)
    
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .update({ 
          consultant_id: selectedConsultor,
          status: 'contato_inicial',
          updated_at: new Date().toISOString()
        })
        .in('id', selectedLeads)

      if (error) throw error

      // Criar tarefas automáticas para os leads atribuídos
      const tasks = selectedLeads.map(leadId => ({
        lead_id: leadId,
        title: 'Primeiro contato com lead',
        description: 'Realizar o primeiro contato com o lead atribuído',
        assigned_to: selectedConsultor,
        created_by: currentUserId,
        status: 'pending',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        created_at: new Date().toISOString()
      }))

      const { error: tasksError } = await (supabase as any)
        .from('tasks')
        .insert(tasks)

      if (tasksError) {
        console.error('Erro ao criar tarefas:', tasksError)
      }

      toast.success(`${selectedLeads.length} lead(s) atribuído(s) com sucesso!`)
      setSelectedLeads([])
      setSelectedConsultor('')
      fetchData()
      
      if (onLeadAssigned) {
        onLeadAssigned()
      }
    } catch (error) {
      console.error('Erro ao atribuir leads:', error)
      toast.error('Erro ao atribuir leads')
    } finally {
      setIsAssigning(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      lead_qualificado: 'bg-blue-50 text-blue-700 border-blue-200',
      contato_inicial: 'bg-purple-50 text-purple-700 border-purple-200',
      reuniao_agendada: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      discovery_concluido: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      proposta_apresentada: 'bg-amber-50 text-amber-700 border-amber-200',
      em_negociacao: 'bg-orange-50 text-orange-700 border-orange-200',
      cliente_ativo: 'bg-green-50 text-green-700 border-green-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      lead_qualificado: 'Lead Qualificado',
      contato_inicial: 'Contato Inicial',
      reuniao_agendada: 'Reunião Agendada',
      discovery_concluido: 'Discovery Concluído',
      proposta_apresentada: 'Proposta Apresentada',
      em_negociacao: 'Em Negociação',
      cliente_ativo: 'Cliente Ativo'
    }
    return labels[status as keyof typeof labels] || status
  }

  if (!isOpen || !canAssign) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Atribuir Leads para Consultores
              </h2>
              <p className="text-sm text-gray-600">
                Direcione leads qualificados para os consultores da equipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando leads...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seleção de Consultor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Consultor de Destino
                </label>
                <select
                  value={selectedConsultor}
                  onChange={(e) => setSelectedConsultor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Escolha um consultor</option>
                  {consultors.map((consultor) => (
                    <option key={consultor.id} value={consultor.id}>
                      {consultor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de Leads */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Leads Disponíveis ({unassignedLeads.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedLeads.length === unassignedLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                    <span className="text-sm text-gray-500">
                      ({selectedLeads.length} selecionados)
                    </span>
                  </div>
                </div>

                {unassignedLeads.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Nenhum lead disponível para atribuição no momento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassignedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          selectedLeads.includes(lead.id)
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleLeadSelection(lead.id, !selectedLeads.includes(lead.id))}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{lead.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status || 'lead_qualificado')}`}>
                              {getStatusLabel(lead.status || 'lead_qualificado')}
                            </span>
                            <span className="text-xs text-gray-500">
                              Score: {lead.score || 0}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            {lead.email && (
                              <span className="flex items-center space-x-1">
                                <span>{lead.email}</span>
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center space-x-1">
                                <span>{lead.phone}</span>
                              </span>
                            )}
                            {lead.origin && (
                              <span className="flex items-center space-x-1">
                                <span>Origem: {lead.origin}</span>
                              </span>
                            )}
                          </div>
                          
                          {lead.notes && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {lead.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {consultors.find(c => c.id === lead.consultant_id)?.name || 'Não atribuído'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedLeads.length > 0 && selectedConsultor && (
              <div className="flex items-center space-x-2">
                <span>{selectedLeads.length} lead(s) selecionado(s)</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium">
                  {consultors.find(c => c.id === selectedConsultor)?.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAssignLeads}
              disabled={selectedLeads.length === 0 || !selectedConsultor || isAssigning}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedLeads.length > 0 && selectedConsultor && !isAssigning
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAssigning ? 'Atribuindo...' : `Atribuir ${selectedLeads.length} Lead(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
