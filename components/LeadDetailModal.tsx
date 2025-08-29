'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MessageSquare, CheckSquare, Clock, User, Mail, Phone, MapPin, Edit3, Trash2, Save, XCircle } from 'lucide-react'
import { AudioRecorder } from './AudioRecorder'
import { AIAssistant } from './AIAssistant'
import { CalendarIntegration } from './CalendarIntegration'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type Interaction = Database['public']['Tables']['interactions']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

interface LeadDetailModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void
  onLeadDelete?: (leadId: string) => void
}

export function LeadDetailModal({ lead, isOpen, onClose, currentUserId, onLeadUpdate, onLeadDelete }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'tasks' | 'calendar' | 'ai'>('overview')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    notes: lead.notes || ''
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (isOpen && lead.id) {
      fetchLeadData()
    }
  }, [isOpen, lead.id])

  const fetchLeadData = async () => {
    setIsLoading(true)
    
    try {
      // Buscar interações
      const { data: interactionsData, error: interactionsError } = await (supabase as any)
        .from('interactions')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })

      if (interactionsError) {
        console.error('Erro ao buscar interações:', interactionsError)
      } else {
        setInteractions(interactionsData || [])
      }

      // Buscar tarefas
      const { data: tasksData, error: tasksError } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })

      if (tasksError) {
        console.error('Erro ao buscar tarefas:', tasksError)
      } else {
        setTasks(tasksData || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados do lead:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranscriptionComplete = (transcription: string, analysis: any) => {
    // Atualizar score do lead se houver análise
    if (analysis?.leadScore && onLeadUpdate) {
      onLeadUpdate(lead.id, { score: analysis.leadScore })
    }
    
    // Recarregar interações para mostrar a nova
    fetchLeadData()
  }

  const handleSaveEdit = async () => {
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .update({
          name: editForm.name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          notes: editForm.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead atualizado com sucesso!')
      setIsEditing(false)
      
      if (onLeadUpdate) {
        onLeadUpdate(lead.id, {
          name: editForm.name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          notes: editForm.notes || null
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast.error('Erro ao atualizar lead')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este lead?')) return

    try {
      const { error } = await (supabase as any)
        .from('leads')
        .delete()
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead excluído com sucesso!')
      onClose()
      
      if (onLeadDelete) {
        onLeadDelete(lead.id)
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
      toast.error('Erro ao excluir lead')
    }
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

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null

    try {
      const analysisData = typeof analysis === 'string' ? JSON.parse(analysis) : analysis
      
      return (
        <div className="bg-blue-50 rounded-lg p-4 mt-3">
          <h4 className="notion-subtitle text-blue-900 mb-2">Análise IA</h4>
          <div className="space-y-2">
            {analysisData.leadScore && (
              <p className="notion-body text-blue-800">
                <strong>Score:</strong> {analysisData.leadScore}/100
              </p>
            )}
            {analysisData.sentiment && (
              <p className="notion-body text-blue-800">
                <strong>Sentimento:</strong> {analysisData.sentiment}
              </p>
            )}
            {analysisData.summary && (
              <p className="notion-body text-blue-800">
                <strong>Resumo:</strong> {analysisData.summary}
              </p>
            )}
            {analysisData.nextSteps && (
              <p className="notion-body text-blue-800">
                <strong>Próximos Passos:</strong> {analysisData.nextSteps}
              </p>
            )}
          </div>
        </div>
      )
    } catch (error) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mt-3">
          <p className="notion-body text-gray-600">Análise não disponível</p>
        </div>
      )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header - Estilo Notion */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="notion-title text-xl font-semibold border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                />
              ) : (
                <h2 className="notion-title text-xl font-semibold text-gray-900">{lead.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(lead.status)}`}>
                  {formatStatus(lead.status)}
                </span>
                {lead.score !== null && lead.score > 0 && (
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getScoreColor(lead.score)}`}>
                    Score: {lead.score}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs - Estilo Notion */}
        <div className="border-b border-gray-100">
          <nav className="flex px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: User },
              { id: 'interactions', label: 'Interações', icon: MessageSquare },
              { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
              { id: 'calendar', label: 'Calendário', icon: Calendar },
              { id: 'ai', label: 'Assistente IA', icon: User }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Informações de Contato */}
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-4">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {isEditing ? (
                      <div>
                        <label className="notion-caption text-gray-600 mb-1 block">E-mail</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="input-field w-full"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="notion-body text-gray-700">{lead.email || 'Não informado'}</span>
                      </div>
                    )}
                    
                    {isEditing ? (
                      <div>
                        <label className="notion-caption text-gray-600 mb-1 block">Telefone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="input-field w-full"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="notion-body text-gray-700">{lead.phone || 'Não informado'}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="notion-body text-gray-700">{lead.origin || 'Não informado'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="notion-body text-gray-700">
                        Criado {formatDistanceToNow(new Date(lead.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-4">Notas</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="input-field w-full h-24 resize-none"
                    placeholder="Adicione observações sobre o lead..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="notion-body text-gray-700">
                      {lead.notes || 'Nenhuma observação adicionada'}
                    </p>
                  </div>
                )}
              </div>

              {/* Resumo de Atividades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-minimal text-center">
                  <div className="text-2xl font-semibold text-blue-600 mb-1">
                    {interactions.length}
                  </div>
                  <div className="notion-caption text-gray-500">Interações</div>
                </div>
                
                <div className="card-minimal text-center">
                  <div className="text-2xl font-semibold text-green-600 mb-1">
                    {tasks.filter(task => task.status === 'completed').length}
                  </div>
                  <div className="notion-caption text-gray-500">Tarefas Concluídas</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="notion-subtitle text-gray-900">Interações</h3>
                <AudioRecorder
                  leadId={lead.id}
                  onTranscriptionComplete={handleTranscriptionComplete}
                />
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="notion-body text-gray-500">Carregando interações...</p>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="notion-body text-gray-500">Nenhuma interação registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="card-minimal">
                      <div className="flex items-start justify-between mb-2">
                        <span className="notion-caption text-gray-500">
                          {formatDistanceToNow(new Date(interaction.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {interaction.type}
                        </span>
                      </div>
                      
                      <p className="notion-body text-gray-700 mb-3">
                        {interaction.content}
                      </p>
                      
                      {interaction.ai_analysis && renderAnalysis(interaction.ai_analysis)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="notion-subtitle text-gray-900">Tarefas</h3>
              
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="notion-body text-gray-500">Nenhuma tarefa criada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="card-minimal">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="notion-subtitle text-gray-900">{task.title}</h4>
                          {task.description && (
                            <p className="notion-body text-gray-600 mt-1">{task.description}</p>
                          )}
                          <p className="notion-caption text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(task.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${task.status === 'completed' 
                            ? 'bg-green-50 text-green-700' 
                            : task.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-50 text-gray-700'
                          }
                        `}>
                          {task.status === 'completed' ? 'Concluída' : 
                           task.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h3 className="notion-subtitle text-gray-900 mb-4">Integração com Calendário</h3>
              <CalendarIntegration 
                userId={currentUserId} 
                leadId={lead.id}
                leadName={lead.name}
                leadEmail={lead.email || ''}
              />
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h3 className="notion-subtitle text-gray-900 mb-4">Assistente IA</h3>
              <AIAssistant leadId={lead.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}