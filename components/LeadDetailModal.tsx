'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MessageSquare, CheckSquare, Clock, Sparkles, User, Mail, Phone, MapPin, Bot, CalendarDays, Edit3, Trash2, Save, XCircle } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'tasks' | 'audio' | 'ai-assistant' | 'calendar'>('overview')
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

  const handleTranscriptionComplete = (data: {
    transcription: string
    analysis: any
    interactionId: string
  }) => {
    toast.success('Análise de IA concluída!')
    fetchLeadData() // Recarregar dados
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) {
        console.error('Erro ao atualizar tarefa:', error)
        toast.error('Erro ao atualizar tarefa')
        return
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )

      toast.success('Tarefa atualizada!')
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    if (score >= 40) return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    return 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      lead_qualificado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contato_inicial: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      reuniao_agendada: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      discovery_concluido: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      proposta_apresentada: 'bg-green-500/20 text-green-400 border-green-500/30',
      em_negociacao: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cliente_ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const formatStatus = (status: string) => {
    const statusMap = {
      lead_qualificado: 'Lead Qualificado',
      contato_inicial: 'Contato Inicial',
      reuniao_agendada: 'Reunião Agendada',
      discovery_concluido: 'Discovery Concluído',
      proposta_apresentada: 'Proposta Apresentada',
      em_negociacao: 'Em Negociação',
      cliente_ativo: 'Cliente Ativo',
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const renderAnalysis = (aiSummary: string) => {
    try {
      const analysis = JSON.parse(aiSummary)
      return (
        <div className="space-y-3">
          {analysis.RESUMO && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-1">Resumo</h5>
              <p className="text-sm text-gray-400">{analysis.RESUMO}</p>
            </div>
          )}
          
          {analysis.SENTIMENTO && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-1">Sentimento</h5>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                analysis.SENTIMENTO === 'Alto' ? 'bg-green-500/20 text-green-400' :
                analysis.SENTIMENTO === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {analysis.SENTIMENTO}
              </span>
            </div>
          )}
          
          {analysis.PRÓXIMAS_AÇÕES && analysis.PRÓXIMAS_AÇÕES.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-1">Próximas Ações</h5>
              <ul className="text-sm text-gray-400 space-y-1">
                {analysis.PRÓXIMAS_AÇÕES.map((action: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-accent-400 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    } catch (error) {
      return <p className="text-sm text-gray-400">Análise não disponível</p>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-600 to-accent-700 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{lead.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(lead.status)}`}>
                  {formatStatus(lead.status)}
                </span>
                {lead.score !== null && lead.score > 0 && (
                  <span className={`px-3 py-1 rounded-full text-xs border ${getScoreColor(lead.score)}`}>
                    Score: {lead.score}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: User },
              { id: 'interactions', label: 'Interações', icon: MessageSquare },
              { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
              { id: 'calendar', label: 'Calendário', icon: CalendarDays },
              { id: 'audio', label: 'Gravador IA', icon: Sparkles },
              { id: 'ai-assistant', label: 'Assistente IA', icon: Bot },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações de Contato</h3>
                  
                  {lead.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{lead.email}</span>
                    </div>
                  )}
                  
                  {lead.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{lead.phone}</span>
                    </div>
                  )}
                  
                  {lead.origin && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 capitalize">{lead.origin}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Criado {formatDistanceToNow(new Date(lead.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Resumo</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-accent-400">{interactions.length}</div>
                        <div className="text-xs text-gray-400">Interações</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</div>
                        <div className="text-xs text-gray-400">Tarefas Concluídas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {lead.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Notas</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-300">{lead.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Histórico de Interações</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner w-6 h-6 mx-auto"></div>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma interação registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-accent-400 capitalize">
                          {interaction.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(interaction.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      
                      {interaction.content && (
                        <p className="text-sm text-gray-300 mb-2">{interaction.content}</p>
                      )}
                      
                      {interaction.transcription && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-300 mb-1">Transcrição</h5>
                          <div className="bg-gray-900 rounded p-3 text-sm text-gray-400">
                            {interaction.transcription}
                          </div>
                        </div>
                      )}
                      
                      {interaction.ai_summary && (
                        <div className="border-t border-gray-700 pt-3">
                          <h5 className="text-sm font-medium text-accent-400 mb-2 flex items-center space-x-1">
                            <Sparkles className="w-4 h-4" />
                            <span>Análise de IA</span>
                          </h5>
                          {renderAnalysis(interaction.ai_summary)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Tarefas</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner w-6 h-6 mx-auto"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma tarefa criada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-800 rounded-lg p-4 flex items-start space-x-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <CheckSquare className="w-3 h-3 text-white" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                        }`}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            Criada {formatDistanceToNow(new Date(task.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          
                          {task.due_date && (
                            <span>
                              Vence em {formatDistanceToNow(new Date(task.due_date), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <CalendarIntegration
                userId={currentUserId}
                leadId={lead.id}
              />
            </div>
          )}

          {activeTab === 'audio' && (
            <div>
              <AudioRecorder
                leadId={lead.id}
                userId={currentUserId}
                onTranscriptionComplete={handleTranscriptionComplete}
              />
            </div>
          )}

          {activeTab === 'ai-assistant' && (
            <div>
              <AIAssistant
                leadId={lead.id}
                userId={currentUserId}
                leadName={lead.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
