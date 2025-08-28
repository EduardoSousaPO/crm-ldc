import { google } from 'googleapis'
import { createSupabaseServiceClient } from './supabase'

// Configuração OAuth2 para Google Calendar
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
)

// Scopes necessários para o Google Calendar
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
]

export class CalendarService {
  private calendar: any
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  }

  // Configurar credenciais do usuário
  async setUserCredentials() {
    const supabase = createSupabaseServiceClient()
    
    const { data: tokens } = await supabase
      .from('user_integrations')
      .select('google_tokens')
      .eq('user_id', this.userId)
      .eq('provider', 'google_calendar')
      .single()

    if (tokens?.google_tokens) {
      oauth2Client.setCredentials(JSON.parse(tokens.google_tokens))
      return true
    }
    
    return false
  }

  // Gerar URL de autorização
  static getAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: CALENDAR_SCOPES,
      prompt: 'consent'
    })
  }

  // Processar callback de autorização
  static async handleCallback(code: string, userId: string) {
    try {
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)

      // Salvar tokens no banco
      const supabase = createSupabaseServiceClient()
      
      await supabase
        .from('user_integrations')
        .upsert({
          user_id: userId,
          provider: 'google_calendar',
          google_tokens: JSON.stringify(tokens),
          is_active: true,
          updated_at: new Date().toISOString()
        })

      return { success: true, tokens }
    } catch (error) {
      console.error('Erro no callback do Google:', error)
      return { success: false, error }
    }
  }

  // Listar calendários disponíveis
  async listCalendars() {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    try {
      const response = await this.calendar.calendarList.list()
      return response.data.items || []
    } catch (error) {
      console.error('Erro ao listar calendários:', error)
      throw error
    }
  }

  // Criar evento no calendário
  async createEvent(eventData: {
    summary: string
    description?: string
    startDateTime: string
    endDateTime: string
    attendeeEmails?: string[]
    calendarId?: string
  }) {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: eventData.attendeeEmails?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 30 }, // 30 min antes
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId: eventData.calendarId || 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      })

      return response.data
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }
  }

  // Listar eventos próximos
  async listUpcomingEvents(maxResults = 10) {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Erro ao listar eventos:', error)
      throw error
    }
  }

  // Atualizar evento existente
  async updateEvent(eventId: string, updates: any, calendarId = 'primary') {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    try {
      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        resource: updates,
        sendUpdates: 'all',
      })

      return response.data
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw error
    }
  }

  // Cancelar evento
  async cancelEvent(eventId: string, calendarId = 'primary') {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao cancelar evento:', error)
      throw error
    }
  }

  // Buscar slots disponíveis
  async findAvailableSlots(
    startDate: string,
    endDate: string,
    duration = 60 // minutos
  ) {
    if (!await this.setUserCredentials()) {
      throw new Error('Usuário não autenticado no Google Calendar')
    }

    try {
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startDate,
          timeMax: endDate,
          timeZone: 'America/Sao_Paulo',
          items: [{ id: 'primary' }],
        },
      })

      const busyTimes = response.data.calendars.primary.busy || []
      
      // Calcular slots disponíveis (implementação simplificada)
      const availableSlots = this.calculateAvailableSlots(
        startDate,
        endDate,
        busyTimes,
        duration
      )

      return availableSlots
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      throw error
    }
  }

  private calculateAvailableSlots(
    startDate: string,
    endDate: string,
    busyTimes: any[],
    duration: number
  ) {
    const slots = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // Horário comercial: 9h às 18h
    const workStart = 9
    const workEnd = 18
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      // Pular fins de semana
      if (d.getDay() === 0 || d.getDay() === 6) continue
      
      for (let hour = workStart; hour < workEnd; hour++) {
        const slotStart = new Date(d)
        slotStart.setHours(hour, 0, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)
        
        // Verificar se não conflita com eventos existentes
        const isAvailable = !busyTimes.some(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          return slotStart < busyEnd && slotEnd > busyStart
        })
        
        if (isAvailable) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          })
        }
      }
    }
    
    return slots.slice(0, 20) // Máximo 20 slots
  }
}
