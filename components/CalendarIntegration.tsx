'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Video, ExternalLink, Plus, Settings } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'

interface CalendarIntegrationProps {
  userId: string
  leadId?: string
  leadName?: string
  leadEmail?: string | null
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  attendees: string[]
  meeting_url?: string
  status: string
}

interface AvailableSlot {
  start: string
  end: string
}

export function CalendarIntegration({ userId, leadId, leadName, leadEmail }: CalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    attendeeEmail: '',
  })

  const supabase = createSupabaseClient()

  useEffect(() => {
    checkIntegrationStatus()
    if (isConnected) {
      fetchEvents()
    }
  }, [userId, isConnected])

  const checkIntegrationStatus = async () => {
    try {
      const { data } = await (supabase as any)
        .from('user_integrations')
        .select('is_active')
        .eq('user_id', userId)
        .eq('provider', 'google_calendar')
        .single()

      setIsConnected(data?.is_active || false)
    } catch (error) {
      console.error('Erro ao verificar integração:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/calendar/events?userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        // Converter eventos do Google para nosso formato
        const formattedEvents = result.events.map((event: any) => ({
          id: event.id,
          title: event.summary || 'Sem título',
          description: event.description,
          start_time: event.start?.dateTime || event.start?.date,
          end_time: event.end?.dateTime || event.end?.date,
          attendees: event.attendees?.map((a: any) => a.email) || [],
          meeting_url: event.conferenceData?.entryPoints?.[0]?.uri,
          status: event.status,
        }))

        setEvents(formattedEvents)
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  const connectCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/auth')
      const result = await response.json()

      if (result.success) {
        // Adicionar userId ao state para o callback
        const authUrlWithState = `${result.authUrl}&state=${userId}`
        window.location.href = authUrlWithState
      } else {
        toast.error('Erro ao conectar com Google Calendar')
      }
    } catch (error) {
      console.error('Erro ao conectar calendário:', error)
      toast.error('Erro ao conectar calendário')
    }
  }

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.startDateTime || !newEvent.endDateTime) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setIsCreatingEvent(true)

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          leadId,
          summary: newEvent.title,
          description: newEvent.description,
          startDateTime: newEvent.startDateTime,
          endDateTime: newEvent.endDateTime,
          attendeeEmails: newEvent.attendeeEmail ? [newEvent.attendeeEmail] : [],
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Evento criado com sucesso!')
        setShowCreateForm(false)
        setNewEvent({
          title: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          attendeeEmail: '',
        })
        fetchEvents()
      } else {
        toast.error('Erro ao criar evento')
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao criar evento')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDefaultEventTitle = () => {
    if (leadId) {
      return 'Reunião - Discovery de Investimentos'
    }
    return 'Reunião de Consultoria'
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-accent-500" />
          <span>Google Calendar</span>
        </h3>

        {isConnected ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-400">Conectado</span>
          </div>
        ) : (
          <button
            onClick={connectCalendar}
            className="btn-primary flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Conectar</span>
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Conecte seu Google Calendar para agendar reuniões automaticamente
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-6">
            <li>• Agendamento automático de reuniões</li>
            <li>• Sincronização bidirecional</li>
            <li>• Links do Google Meet incluídos</li>
            <li>• Lembretes automáticos</li>
          </ul>
          <button
            onClick={connectCalendar}
            className="btn-primary"
          >
            Conectar Google Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Botão Criar Evento */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Próximos eventos ({events.length})
            </p>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Reunião</span>
            </button>
          </div>

          {/* Formulário de Criar Evento */}
          {showCreateForm && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h4 className="font-medium text-white mb-4">Nova Reunião</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder={getDefaultEventTitle()}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Pauta da reunião, objetivos, etc..."
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Início *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fim *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-mail do convidado
                  </label>
                  <input
                    type="email"
                    value={newEvent.attendeeEmail}
                    onChange={(e) => setNewEvent({ ...newEvent, attendeeEmail: e.target.value })}
                    placeholder="cliente@email.com"
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createEvent}
                    disabled={isCreatingEvent}
                    className="btn-primary flex-1"
                  >
                    {isCreatingEvent ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>Criando...</span>
                      </div>
                    ) : (
                      'Criar Evento'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Eventos */}
          {events.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento próximo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{event.title}</h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateTime(event.start_time)}</span>
                        </div>
                        
                        {event.attendees.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees.length} convidado(s)</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {event.meeting_url && (
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-accent-400 hover:text-accent-300 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
