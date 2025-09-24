'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Star,
  MessageSquare,
  Edit3,
  Save,
  XCircle,
  TrendingUp,
  Target,
  DollarSign
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AudioRecorder } from './AudioRecorder'
import { ContactHistoryPanel } from './ContactHistoryPanel'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type Interaction = Database['public']['Tables']['interactions']['Row']

interface OptimizedLeadModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onUpdate?: (leadId: string, updates: Partial<Lead>) => void
  onDelete?: (leadId: string) => void
  currentUserId: string
}

export function OptimizedLeadModal({
  lead,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  currentUserId
}: OptimizedLeadModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'interactions' | 'contacts'>('details')
  const [editForm, setEditForm] = useState({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    notes: lead.notes || '',
    investment_profile: (lead as any).investment_profile || '',
    investment_amount: (lead as any).investment_amount || 0
  })

  const supabase = createSupabaseClient()

  useEffect(() => {
    if (isOpen && lead.id) {
      fetchInteractions()
    }
  }, [isOpen, lead.id])

  const fetchInteractions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setInteractions(data || [])
    } catch (error) {
      console.error('Erro ao buscar interações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const updates = {
        name: editForm.name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        notes: editForm.notes || null,
        investment_profile: editForm.investment_profile || null,
        investment_amount: editForm.investment_amount || 0,
        updated_at: new Date().toISOString()
      }

      const { error } = await (supabase as any)
        .from('leads')
        .update(updates)
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead atualizado com sucesso!')
      setIsEditing(false)
      
      if (onUpdate) {
        onUpdate(lead.id, updates)
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast.error('Erro ao atualizar lead')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead excluído com sucesso!')
      onClose()
      
      if (onDelete) {
        onDelete(lead.id)
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
      toast.error('Erro ao excluir lead')
    }
  }

  const handleTranscriptionComplete = () => {
    fetchInteractions()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'lead_qualificado': 'bg-blue-50 text-blue-700 border-blue-200',
      'contato_inicial': 'bg-purple-50 text-purple-700 border-purple-200',
      'reuniao_agendada': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'discovery_concluido': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'proposta_apresentada': 'bg-amber-50 text-amber-700 border-amber-200',
      'em_negociacao': 'bg-orange-50 text-orange-700 border-orange-200',
      'cliente_ativo': 'bg-green-50 text-green-700 border-green-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200'
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200'
    if (score >= 40) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const formatStatus = (status: string) => {
    const statusMap = {
      'lead_qualificado': 'Lead Qualificado',
      'contato_inicial': 'Contato Inicial',
      'reuniao_agendada': 'Reunião Agendada',
      'discovery_concluido': 'Discovery Concluído',
      'proposta_apresentada': 'Proposta Apresentada',
      'em_negociacao': 'Em Negociação',
      'cliente_ativo': 'Cliente Ativo'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const formatInvestmentAmount = (amount: number) => {
    if (!amount) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const renderInteractionAnalysis = (analysis: any) => {
    if (!analysis) return null

    try {
      const analysisData = typeof analysis === 'string' ? JSON.parse(analysis) : analysis
      
      return (
        <div className="bg-blue-50 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Análise IA</span>
          </div>
          
          <div className="space-y-1 text-sm text-blue-800">
            {analysisData.leadScore && (
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-semibold">{analysisData.leadScore}/100</span>
              </div>
            )}
            {analysisData.sentiment && (
              <div className="flex justify-between">
                <span>Sentimento:</span>
                <span className="font-semibold">{analysisData.sentiment}</span>
              </div>
            )}
            {analysisData.summary && (
              <p className="text-xs mt-2 p-2 bg-blue-100 rounded">
                <strong>Resumo:</strong> {analysisData.summary}
              </p>
            )}
          </div>
        </div>
      )
    } catch (error) {
      return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="notion-modal-container bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header - Estilo Notion */}
        <div className="flex items-center justify-between p-4 border-b notion-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="notion-title-input"
                />
              ) : (
                <h2 className="notion-title text-base font-semibold">{lead.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`notion-tag ${getStatusColor(lead.status || 'lead_qualificado')}`}>
                  {formatStatus(lead.status || 'lead_qualificado')}
                </span>
                {lead.score !== null && lead.score > 0 && (
                  <span className={`notion-tag ${getScoreColor(lead.score)}`}>
                    <Star className="w-3 h-3 inline -mt-0.5 mr-1" />
                    {lead.score}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="notion-btn-modal notion-btn-primary">
                  <Save className="w-3 h-3" /> Salvar
                </button>
                <button onClick={() => setIsEditing(false)} className="notion-btn-modal notion-btn-secondary">
                  <XCircle className="w-3 h-3" /> Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="notion-btn-modal notion-btn-secondary">
                <Edit3 className="w-3 h-3" /> Editar
              </button>
            )}
            
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Abas e Conteúdo */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 p-6 border-r notion-border overflow-y-auto">
            
            {/* Informações de Contato */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
              <div className="space-y-3">
                
                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="email@exemplo.com"
                    />
                  ) : (
                    <span className="text-gray-700">{lead.email || 'Não informado'}</span>
                  )}
                </div>
                
                {/* Telefone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <span className="text-gray-700">{lead.phone || 'Não informado'}</span>
                  )}
                </div>
                
                {/* Origem */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{lead.origin || 'Não informado'}</span>
                </div>
                
                {/* Data de Criação */}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">
                    Criado {formatDistanceToNow(new Date(lead.created_at || Date.now()), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Perfil de Investimento */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Perfil de Investimento
              </h3>
              
              <div className="space-y-3">
                {/* Perfil */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Perfil</label>
                  {isEditing ? (
                    <select
                      value={editForm.investment_profile}
                      onChange={(e) => setEditForm({ ...editForm, investment_profile: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Selecione o perfil</option>
                      <option value="conservador">Conservador</option>
                      <option value="moderado">Moderado</option>
                      <option value="arrojado">Arrojado</option>
                    </select>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        (lead as any).investment_profile === 'conservador' ? 'bg-green-100 text-green-800' :
                        (lead as any).investment_profile === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                        (lead as any).investment_profile === 'arrojado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(lead as any).investment_profile || 'Não definido'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Valor de Investimento */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor Disponível</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.investment_amount}
                      onChange={(e) => setEditForm({ ...editForm, investment_amount: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700 font-medium">
                        {formatInvestmentAmount((lead as any).investment_amount || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
              {isEditing ? (
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Adicione observações sobre o lead..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    {lead.notes || 'Nenhuma observação adicionada'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Tabs */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="border-b notion-border px-4">
              <nav className="flex gap-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`notion-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => setActiveTab('interactions')}
                  className={`notion-tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
                >
                  Interações
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`notion-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                >
                  Contatos
                </button>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes Adicionais</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>Informações detalhadas do lead aparecerão aqui.</p>
                  </div>
                </div>
              )}

              {activeTab === 'interactions' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Timeline de Interações
                    </h3>
                    <AudioRecorder
                      leadId={lead.id}
                      onTranscriptionComplete={handleTranscriptionComplete}
                    />
                  </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : interactions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma interação registrada</p>
                <p className="text-gray-400 text-sm mt-1">Use o gravador de áudio para adicionar a primeira interação</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <div key={interaction.id} className="relative">
                    {/* Timeline Line */}
                    {index < interactions.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(interaction.created_at || Date.now()), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {interaction.type}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-2">
                            {interaction.content}
                          </p>
                          
                          {interaction.ai_summary && renderInteractionAnalysis(interaction.ai_summary)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
                </div>
              )}

              {activeTab === 'contacts' && (
                <ContactHistoryPanel
                  leadId={lead.id}
                  currentUserId={currentUserId}
                  onContactAttemptCreated={() => {
                    // Opcional: recarregar dados do lead se necessário
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
