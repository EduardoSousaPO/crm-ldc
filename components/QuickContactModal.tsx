'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Mail, MessageCircle, Linkedin, Users, Video, MessageSquare, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { ContactMethod, ContactStatus, FollowUpPriority, FollowUpTemplate } from '@/types/supabase'

interface QuickContactModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  onContactAttemptCreated?: () => void
}

const CONTACT_METHODS = [
  { value: 'phone' as ContactMethod, label: 'Telefone', icon: Phone },
  { value: 'email' as ContactMethod, label: 'Email', icon: Mail },
  { value: 'whatsapp' as ContactMethod, label: 'WhatsApp', icon: MessageCircle },
  { value: 'linkedin' as ContactMethod, label: 'LinkedIn', icon: Linkedin },
  { value: 'in_person' as ContactMethod, label: 'Pessoalmente', icon: Users },
  { value: 'video_call' as ContactMethod, label: 'Vídeo chamada', icon: Video },
  { value: 'sms' as ContactMethod, label: 'SMS', icon: MessageSquare },
]

const CONTACT_STATUSES = [
  { value: 'not_answered' as ContactStatus, label: 'Não atendeu', color: 'text-red-600' },
  { value: 'requested_callback' as ContactStatus, label: 'Pediu retorno', color: 'text-yellow-600' },
  { value: 'meeting_scheduled' as ContactStatus, label: 'Reunião agendada', color: 'text-green-600' },
  { value: 'not_interested' as ContactStatus, label: 'Não interessado', color: 'text-gray-600' },
  { value: 'converted' as ContactStatus, label: 'Convertido', color: 'text-emerald-600' },
  { value: 'invalid_contact' as ContactStatus, label: 'Contato inválido', color: 'text-red-700' },
  { value: 'busy_try_later' as ContactStatus, label: 'Ocupado - tentar depois', color: 'text-orange-600' },
  { value: 'voicemail_left' as ContactStatus, label: 'Mensagem deixada', color: 'text-blue-600' },
  { value: 'email_sent' as ContactStatus, label: 'Email enviado', color: 'text-indigo-600' },
  { value: 'follow_up_scheduled' as ContactStatus, label: 'Follow-up agendado', color: 'text-purple-600' },
]

const PRIORITIES = [
  { value: 'low' as FollowUpPriority, label: 'Baixa', color: 'text-green-600' },
  { value: 'medium' as FollowUpPriority, label: 'Média', color: 'text-yellow-600' },
  { value: 'high' as FollowUpPriority, label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent' as FollowUpPriority, label: 'Urgente', color: 'text-red-600' },
]

export function QuickContactModal({ isOpen, onClose, leadId, onContactAttemptCreated }: QuickContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templates, setTemplates] = useState<FollowUpTemplate[]>([])
  const [formData, setFormData] = useState({
    contact_method: 'phone' as ContactMethod,
    status: 'not_answered' as ContactStatus,
    duration_minutes: '',
    notes: '',
    next_action: '',
    next_contact_date: '',
    priority: 'medium' as FollowUpPriority,
    outcome_summary: '',
    template_used: '',
    completed_date: new Date().toISOString().slice(0, 16), // formato datetime-local
  })

  // Carregar templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/follow-up-templates?is_active=true')
        if (response.ok) {
          const result = await response.json()
          setTemplates(result.data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar templates:', error)
      }
    }

    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  // Filtrar templates por método de contato
  const filteredTemplates = templates.filter(
    template => template.contact_method === formData.contact_method
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        lead_id: leadId,
        attempt_type: 'outbound',
        contact_method: formData.contact_method,
        status: formData.status,
        completed_date: formData.completed_date,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        notes: formData.notes.trim() || undefined,
        next_action: formData.next_action.trim() || undefined,
        next_contact_date: formData.next_contact_date || undefined,
        priority: formData.priority,
        outcome_summary: formData.outcome_summary.trim() || undefined,
        template_used: formData.template_used || undefined,
      }

      const response = await fetch('/api/contact-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao registrar contato')
      }

      toast.success('Tentativa de contato registrada com sucesso!')
      onContactAttemptCreated?.()
      onClose()
      
      // Reset form
      setFormData({
        contact_method: 'phone',
        status: 'not_answered',
        duration_minutes: '',
        notes: '',
        next_action: '',
        next_contact_date: '',
        priority: 'medium',
        outcome_summary: '',
        template_used: '',
        completed_date: new Date().toISOString().slice(0, 16),
      })
    } catch (error: any) {
      console.error('Erro ao registrar contato:', error)
      toast.error(error.message || 'Erro ao registrar contato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_used: templateId,
        notes: template.template_content,
        // Sugerir próximo contato baseado no template
        next_contact_date: template.suggested_timing_days ? 
          new Date(Date.now() + template.suggested_timing_days * 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 16) : prev.next_contact_date
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Registrar Tentativa de Contato
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Método de contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Contato
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CONTACT_METHODS.map((method) => {
                  const IconComponent = method.icon
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contact_method: method.value }))}
                      className={`flex items-center gap-2 p-3 text-sm border rounded-lg transition-colors ${
                        formData.contact_method === method.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="truncate">{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Template (se disponível) */}
            {filteredTemplates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template (opcional)
                </label>
                <select
                  value={formData.template_used}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecionar template...</option>
                  {filteredTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Data/Hora do contato */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data/Hora do Contato
                </label>
                <input
                  type="datetime-local"
                  value={formData.completed_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 15"
                  min="1"
                />
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Contato
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ContactStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {CONTACT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as FollowUpPriority }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Detalhes da conversa, pontos importantes..."
              />
            </div>

            {/* Resultado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado do Contato
              </label>
              <textarea
                value={formData.outcome_summary}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome_summary: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Resumo do resultado, decisões tomadas..."
              />
            </div>

            {/* Próxima ação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próxima Ação
              </label>
              <input
                type="text"
                value={formData.next_action}
                onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Enviar proposta, Agendar reunião..."
              />
            </div>

            {/* Próximo contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Próximo Contato (opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.next_contact_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_contact_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Contato'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
