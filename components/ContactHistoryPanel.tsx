'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Linkedin, 
  Users, 
  Video,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { ContactAttempt, ContactMethod, ContactStatus } from '@/types/supabase'
import { QuickContactModal } from './QuickContactModal'

interface ContactHistoryPanelProps {
  leadId: string
  currentUserId: string
  onContactAttemptCreated?: () => void
}

const CONTACT_METHOD_ICONS = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  in_person: Users,
  video_call: Video,
  sms: MessageSquare,
} as const

const CONTACT_STATUS_COLORS = {
  not_answered: 'text-red-500 bg-red-50',
  requested_callback: 'text-yellow-500 bg-yellow-50',
  meeting_scheduled: 'text-green-500 bg-green-50',
  not_interested: 'text-gray-500 bg-gray-50',
  converted: 'text-emerald-500 bg-emerald-50',
  invalid_contact: 'text-red-600 bg-red-100',
  busy_try_later: 'text-orange-500 bg-orange-50',
  voicemail_left: 'text-blue-500 bg-blue-50',
  email_sent: 'text-indigo-500 bg-indigo-50',
  follow_up_scheduled: 'text-purple-500 bg-purple-50',
} as const

const CONTACT_STATUS_LABELS = {
  not_answered: 'Não atendeu',
  requested_callback: 'Pediu retorno',
  meeting_scheduled: 'Reunião agendada',
  not_interested: 'Não interessado',
  converted: 'Convertido',
  invalid_contact: 'Contato inválido',
  busy_try_later: 'Ocupado - tentar depois',
  voicemail_left: 'Mensagem deixada',
  email_sent: 'Email enviado',
  follow_up_scheduled: 'Follow-up agendado',
} as const

const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100',
} as const

export function ContactHistoryPanel({ leadId, currentUserId, onContactAttemptCreated }: ContactHistoryPanelProps) {
  const [contactAttempts, setContactAttempts] = useState<ContactAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isQuickContactModalOpen, setIsQuickContactModalOpen] = useState(false)

  // Carregar histórico de contatos
  useEffect(() => {
    const fetchContactAttempts = async () => {
      try {
        const response = await fetch(`/api/contact-attempts?lead_id=${leadId}`)
        
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao carregar histórico')
        }
        
        setContactAttempts(result.data || [])
      } catch (error: any) {
        console.error('Erro ao carregar histórico de contatos:', error)
        toast.error(error.message || 'Erro ao carregar histórico de contatos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContactAttempts()
  }, [leadId])

  const handleContactAttemptCreated = () => {
    // Recarregar lista
    const fetchContactAttempts = async () => {
      try {
        const response = await fetch(`/api/contact-attempts?lead_id=${leadId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao recarregar histórico')
        }
        
        setContactAttempts(result.data || [])
        onContactAttemptCreated?.()
      } catch (error: any) {
        console.error('Erro ao carregar histórico de contatos:', error)
        toast.error(error.message || 'Erro ao recarregar histórico de contatos')
      }
    }

    fetchContactAttempts()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Contatos</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Histórico de Contatos
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({contactAttempts.length} tentativas)
          </span>
        </h3>
        <button
          onClick={() => setIsQuickContactModalOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar Contato
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {contactAttempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nenhuma tentativa de contato registrada</p>
            <button
              onClick={() => setIsQuickContactModalOpen(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Registrar primeira tentativa
            </button>
          </div>
        ) : (
          contactAttempts.map((attempt, index) => {
            const MethodIcon = CONTACT_METHOD_ICONS[attempt.contact_method as ContactMethod]
            const isLast = index === contactAttempts.length - 1

            return (
              <div key={attempt.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                )}

                {/* Attempt card */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full">
                      <MethodIcon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            CONTACT_STATUS_COLORS[attempt.status as ContactStatus]
                          }`}>
                            {CONTACT_STATUS_LABELS[attempt.status as ContactStatus]}
                          </span>
                          {attempt.priority && attempt.priority !== 'medium' && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              PRIORITY_COLORS[attempt.priority]
                            }`}>
                              {attempt.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(attempt.created_at!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2">
                        {attempt.duration_minutes && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Duração: {attempt.duration_minutes} minutos</span>
                          </div>
                        )}

                        {attempt.notes && (
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Observações:</p>
                            <p className="whitespace-pre-wrap">{attempt.notes}</p>
                          </div>
                        )}

                        {attempt.outcome_summary && (
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Resultado:</p>
                            <p className="whitespace-pre-wrap">{attempt.outcome_summary}</p>
                          </div>
                        )}

                        {attempt.next_action && (
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Próxima ação:</p>
                            <p className="whitespace-pre-wrap">{attempt.next_action}</p>
                          </div>
                        )}

                        {attempt.next_contact_date && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Próximo contato: {format(new Date(attempt.next_contact_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            por {(attempt as any).user?.name || 'Usuário'}
                          </span>
                          <span className="capitalize">
                            {attempt.contact_method.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quick Contact Modal */}
      <QuickContactModal
        isOpen={isQuickContactModalOpen}
        onClose={() => setIsQuickContactModalOpen(false)}
        leadId={leadId}
        onContactAttemptCreated={handleContactAttemptCreated}
      />
    </div>
  )
}
