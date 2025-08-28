'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MessageSquare, CheckSquare, Clock, Sparkles, User, Mail, Phone, MapPin, Bot, CalendarDays, Edit3, Trash2, Save, XCircle, UserCheck, Users } from 'lucide-react'
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
type UserProfile = Database['public']['Tables']['users']['Row']

interface EnhancedLeadDetailModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  currentUserRole: string
  consultors?: UserProfile[]
  onLeadUpdate?: (leadId: string, updates: Partial<Lead>) => void
  onLeadDelete?: (leadId: string) => void
}

export function EnhancedLeadDetailModal({ 
  lead, 
  isOpen, 
  onClose, 
  currentUserId, 
  currentUserRole,
  consultors = [],
  onLeadUpdate, 
  onLeadDelete 
}: EnhancedLeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'tasks' | 'audio' | 'ai-assistant' | 'calendar'>('overview')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    notes: lead.notes || '',
    consultant_id: lead.consultant_id
  })
  const [newComment, setNewComment] = useState('')
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: lead.consultant_id })
  const supabase = createSupabaseClient()

  // Verifica permissões
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'sdr' || lead.consultant_id === currentUserId
  const canDelete = currentUserRole === 'admin'
  const canAssign = currentUserRole === 'admin' || currentUserRole === 'sdr'

  useEffect(() => {
    if (isOpen && lead.id) {
      fetchLeadData()
      setEditForm({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        notes: lead.notes || '',
        consultant_id: lead.consultant_id
      })
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

  const handleSaveEdit = async () => {
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .update({
          name: editForm.name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          notes: editForm.notes || null,
          consultant_id: editForm.consultant_id,
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
          notes: editForm.notes || null,
          consultant_id: editForm.consultant_id,
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      toast.error('Erro ao atualizar lead')
    }
  }

  const handleDeleteLead = async () => {
    if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      return
    }

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          lead_id: lead.id,
          type: 'note',
          content: newComment,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setNewComment('')
      toast.success('Comentário adicionado!')
      fetchLeadData()
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .insert({
          lead_id: lead.id,
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assigned_to,
          created_by: currentUserId,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setNewTask({ title: '', description: '', assigned_to: lead.consultant_id })
      toast.success('Tarefa criada!')
      fetchLeadData()
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      toast.error('Erro ao criar tarefa')
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
      
      toast.success('Status da tarefa atualizado!')
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-xl font-semibold border-b border-gray-300 focus:border-blue-500 outline-none"
                  />
                ) : (
                  lead.name
                )}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                  {getStatusLabel(lead.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreColor(lead.score || 0)}`}>
                  Score: {lead.score || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Salvar alterações"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Cancelar edição"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar lead"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            
            {canDelete && (
              <button
                onClick={handleDeleteLead}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Excluir lead"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {[
            { id: 'overview', label: 'Visão Geral', icon: User },
            { id: 'interactions', label: 'Interações', icon: MessageSquare },
            { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
            { id: 'audio', label: 'Áudio', icon: Sparkles },
            { id: 'ai-assistant', label: 'Assistente IA', icon: Bot },
            { id: 'calendar', label: 'Calendário', icon: CalendarDays }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{lead.email || 'Não informado'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{lead.phone || 'Não informado'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origem
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{lead.origin || 'Não informado'}</span>
                    </div>
                  </div>
                  
                  {canAssign && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultor Responsável
                      </label>
                      {isEditing ? (
                        <select
                          value={editForm.consultant_id}
                          onChange={(e) => setEditForm({ ...editForm, consultant_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecionar consultor</option>
                          {consultors.map((consultor) => (
                            <option key={consultor.id} value={consultor.id}>
                              {consultor.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <UserCheck className="w-4 h-4 text-gray-400" />
                          <span>
                            {consultors.find(c => c.id === lead.consultant_id)?.name || 'Não atribuído'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adicione observações sobre este lead..."
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">
                      {lead.notes || 'Nenhuma observação adicionada'}
                    </p>
                  </div>
                )}
              </div>

              {/* Adicionar comentário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adicionar Comentário
                </label>
                <div className="flex space-x-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite um comentário..."
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Histórico de Interações</h3>
              {interactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma interação registrada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600 capitalize">
                          {interaction.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(interaction.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="text-gray-900">{interaction.content}</p>
                      {interaction.ai_summary && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Resumo IA:</strong> {interaction.ai_summary}
                          </p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Tarefas</h3>
              </div>
              
              {/* Criar nova tarefa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Nova Tarefa</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Título da tarefa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Descrição da tarefa"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {canAssign && (
                    <select
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Atribuir para</option>
                      {consultors.map((consultor) => (
                        <option key={consultor.id} value={consultor.id}>
                          {consultor.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Criar Tarefa
                  </button>
                </div>
              </div>

              {/* Lista de tarefas */}
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma tarefa criada ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <CheckSquare className="w-3 h-3" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            Criada {formatDistanceToNow(new Date(task.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          {task.due_date && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Vence {formatDistanceToNow(new Date(task.due_date), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
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

          {activeTab === 'audio' && (
            <div>
              <AudioRecorder
                leadId={lead.id}
                userId={currentUserId}
                onTranscriptionComplete={(data) => {
                  toast.success('Análise de IA concluída!')
                  fetchLeadData()
                }}
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

          {activeTab === 'calendar' && (
            <div>
              <CalendarIntegration
                leadId={lead.id}
                userId={currentUserId}
                leadName={lead.name}
                leadEmail={lead.email}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
