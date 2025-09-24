'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'
import { X, Plus, Trash } from 'lucide-react'

interface CreateWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  onWorkflowCreated: () => void
  userId: string
}

interface WorkflowAction {
  type: 'send_email' | 'send_whatsapp' | 'create_task' | 'schedule_meeting' | 'update_lead_score'
  config: Record<string, any>
  delay?: number
}

const ACTION_TYPES = [
  { value: 'send_email', label: 'Enviar Email' },
  { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
  { value: 'create_task', label: 'Criar Tarefa' },
  { value: 'schedule_meeting', label: 'Agendar Reunião' },
  { value: 'update_lead_score', label: 'Atualizar Score' },
]

const TRIGGER_TYPES = [
  { value: 'lead_status_change', label: 'Mudança de Status do Lead' },
  { value: 'lead_created', label: 'Lead Criado' },
  { value: 'interaction_added', label: 'Interação Adicionada' },
  { value: 'task_completed', label: 'Tarefa Concluída' },
  { value: 'schedule', label: 'Agendamento (Cron)' },
  { value: 'manual', label: 'Execução Manual' },
]

export function CreateWorkflowModal({ isOpen, onClose, onWorkflowCreated, userId }: CreateWorkflowModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: '',
    triggerConfig: {} as Record<string, any>,
  })
  const [actions, setActions] = useState<WorkflowAction[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.triggerType || actions.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await (supabase as any)
        .from('automation_workflows')
        .insert({
          user_id: userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          trigger_type: formData.triggerType,
          trigger_config: JSON.stringify(formData.triggerConfig),
          actions: JSON.stringify(actions),
          is_active: true,
        })

      if (error) throw error

      toast.success('Workflow criado com sucesso!')
      onWorkflowCreated()
      handleClose()
    } catch (error) {
      console.error('Erro ao criar workflow:', error)
      toast.error('Erro ao criar workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      triggerType: '',
      triggerConfig: {},
    })
    setActions([])
    onClose()
  }

  const addAction = () => {
    setActions(prev => [...prev, {
      type: 'send_email',
      config: {},
      delay: 0
    }])
  }

  const updateAction = (index: number, field: keyof WorkflowAction, value: any) => {
    setActions(prev => prev.map((action, i) => 
      i === index ? { ...action, [field]: value } : action
    ))
  }

  const removeAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index))
  }

  const renderTriggerConfig = () => {
    switch (formData.triggerType) {
      case 'lead_status_change':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status de Origem
            </label>
            <select
              value={formData.triggerConfig.fromStatus || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                triggerConfig: { ...prev.triggerConfig, fromStatus: e.target.value }
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Qualquer status</option>
              <option value="lead_qualificado">Lead Qualificado</option>
              <option value="reuniao_agendada">Reunião Agendada</option>
              <option value="proposta_apresentada">Proposta Apresentada</option>
            </select>
            
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Status de Destino
            </label>
            <select
              value={formData.triggerConfig.toStatus || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                triggerConfig: { ...prev.triggerConfig, toStatus: e.target.value }
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecione o status</option>
              <option value="lead_qualificado">Lead Qualificado</option>
              <option value="reuniao_agendada">Reunião Agendada</option>
              <option value="proposta_apresentada">Proposta Apresentada</option>
              <option value="cliente_ativo">Cliente Ativo</option>
            </select>
          </div>
        )
      
      case 'schedule':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expressão Cron
            </label>
            <input
              type="text"
              value={formData.triggerConfig.cronExpression || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                triggerConfig: { ...prev.triggerConfig, cronExpression: e.target.value }
              }))}
              placeholder="0 9 * * 1-5 (Todo dia útil às 9h)"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Exemplo: 0 9 * * 1-5 (Segunda a sexta às 9h)
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  const renderActionConfig = (action: WorkflowAction, index: number) => {
    switch (action.type) {
      case 'send_email':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                value={action.config.subject || ''}
                onChange={(e) => updateAction(index, 'config', { ...action.config, subject: e.target.value })}
                placeholder="Assunto do email"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={action.config.message || ''}
                onChange={(e) => updateAction(index, 'config', { ...action.config, message: e.target.value })}
                placeholder="Corpo do email (use {{lead.name}} para personalizar)"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
        )
      
      case 'send_whatsapp':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <textarea
              value={action.config.message || ''}
              onChange={(e) => updateAction(index, 'config', { ...action.config, message: e.target.value })}
              placeholder="Mensagem do WhatsApp (use {{lead.name}} para personalizar)"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>
        )
      
      case 'create_task':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Tarefa
              </label>
              <input
                type="text"
                value={action.config.title || ''}
                onChange={(e) => updateAction(index, 'config', { ...action.config, title: e.target.value })}
                placeholder="Título da tarefa"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={action.config.description || ''}
                onChange={(e) => updateAction(index, 'config', { ...action.config, description: e.target.value })}
                placeholder="Descrição da tarefa"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo (dias)
              </label>
              <input
                type="number"
                value={action.config.dueDays || 1}
                onChange={(e) => updateAction(index, 'config', { ...action.config, dueDays: parseInt(e.target.value) })}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )
      
      case 'update_lead_score':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Incremento no Score
            </label>
            <input
              type="number"
              value={action.config.increment || 0}
              onChange={(e) => updateAction(index, 'config', { ...action.config, increment: parseInt(e.target.value) })}
              min="-100"
              max="100"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )
      
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Criar Nova Automação</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Automação *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Follow-up automático para leads qualificados"
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que esta automação faz"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>

          {/* Trigger */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gatilho (Trigger)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Gatilho *
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value, triggerConfig: {} }))}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione o gatilho</option>
                {TRIGGER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {renderTriggerConfig()}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Ações</h3>
              <button
                type="button"
                onClick={addAction}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Adicionar Ação
              </button>
            </div>

            {actions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Ação {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Ação
                    </label>
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(index, 'type', e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {ACTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {renderActionConfig(action, index)}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay (minutos)
                    </label>
                    <input
                      type="number"
                      value={action.delay || 0}
                      onChange={(e) => updateAction(index, 'delay', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}

            {actions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma ação configurada</p>
                <button
                  type="button"
                  onClick={addAction}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Adicionar primeira ação
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar Automação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
