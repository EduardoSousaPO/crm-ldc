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
      // Redirecionar para OAuth do Google
      window.location.href = `/api/calendar/auth?userId=${userId}`
    } catch (error) {
      console.error('Erro ao conectar calendário:', error)
      toast.error('Erro ao conectar com Google Calendar')
    }
  }

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.startDateTime || !newEvent.endDateTime) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsCreatingEvent(true)

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        startDateTime: newEvent.startDateTime,
        endDateTime: newEvent.endDateTime,
        attendeeEmail: newEvent.attendeeEmail || leadEmail,
        leadId: leadId,
      }

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...eventData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Reunião criada com sucesso!')
        setShowCreateForm(false)
        setNewEvent({
          title: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          attendeeEmail: '',
        })
        fetchEvents() // Recarregar eventos
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao criar reunião')
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

  if (isLoading) {
    return (
      <div className="card-minimal">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="notion-body text-gray-500">Carregando integração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-minimal">
      <div className="flex items-center justify-between mb-6">
        <h3 className="notion-subtitle text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span>Integração com Google Calendar</span>
        </h3>
        
        {isConnected && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reunião</span>
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="notion-subtitle text-gray-900 mb-2">Conectar Google Calendar</h4>
          <p className="notion-body text-gray-500 mb-6">
            Conecte sua conta do Google para agendar reuniões diretamente do CRM
          </p>
          <button
            onClick={connectCalendar}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Settings className="w-4 h-4" />
            Conectar Calendário
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Formulário de Nova Reunião */}
          {showCreateForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="notion-subtitle text-blue-900 mb-4">Nova Reunião</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="notion-caption text-blue-800 mb-1 block">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="input-field w-full"
                    placeholder={`Reunião com ${leadName || 'cliente'}`}
                  />
                </div>

                <div>
                  <label className="notion-caption text-blue-800 mb-1 block">
                    Descrição
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="input-field w-full h-20 resize-none"
                    placeholder="Agenda da reunião, tópicos a discutir..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="notion-caption text-blue-800 mb-1 block">
                      Data/Hora Início *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startDateTime: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="notion-caption text-blue-800 mb-1 block">
                      Data/Hora Fim *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endDateTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endDateTime: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="notion-caption text-blue-800 mb-1 block">
                    E-mail do Participante
                  </label>
                  <input
                    type="email"
                    value={newEvent.attendeeEmail}
                    onChange={(e) => setNewEvent({ ...newEvent, attendeeEmail: e.target.value })}
                    className="input-field w-full"
                    placeholder={leadEmail || 'email@exemplo.com'}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary"
                    disabled={isCreatingEvent}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createEvent}
                    className="btn-primary"
                    disabled={isCreatingEvent}
                  >
                    {isCreatingEvent ? 'Criando...' : 'Criar Reunião'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Eventos */}
          <div>
            <h4 className="notion-subtitle text-gray-900 mb-4">Próximas Reuniões</h4>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="notion-body text-gray-500">Nenhuma reunião agendada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="notion-subtitle text-gray-900">{event.title}</h5>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="notion-caption text-gray-600">
                              {formatDateTime(event.start_time)}
                            </span>
                          </div>
                          
                          {event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="notion-caption text-gray-600">
                                {event.attendees.length} participante{event.attendees.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="notion-body text-gray-600 mt-2 text-sm">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {event.meeting_url && (
                        <a
                          href={event.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-1 ml-4"
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

          {/* Status da Integração */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="notion-caption text-green-800">
                Google Calendar conectado e sincronizado
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}