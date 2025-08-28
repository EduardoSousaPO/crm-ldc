import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/lib/calendar'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    const calendarService = new CalendarService(userId)
    const events = await calendarService.listUpcomingEvents(20)

    return NextResponse.json({
      success: true,
      events,
    })
  } catch (error) {
    console.error('Erro ao listar eventos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      leadId,
      meetingId,
      summary,
      description,
      startDateTime,
      endDateTime,
      attendeeEmails,
    } = await request.json()

    if (!userId || !summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const calendarService = new CalendarService(userId)
    
    // Criar evento no Google Calendar
    const googleEvent = await calendarService.createEvent({
      summary,
      description,
      startDateTime,
      endDateTime,
      attendeeEmails,
    })

    // Salvar no banco de dados
    const supabase = createSupabaseServiceClient()
    
    const { data: calendarEvent, error } = await supabase
      .from('calendar_events')
      .insert({
        lead_id: leadId,
        meeting_id: meetingId,
        user_id: userId,
        google_event_id: googleEvent.id,
        title: summary,
        description,
        start_time: startDateTime,
        end_time: endDateTime,
        attendees: attendeeEmails || [],
        meeting_url: googleEvent.conferenceData?.entryPoints?.[0]?.uri,
        status: 'scheduled',
        sync_status: 'synced',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar evento no banco:', error)
    }

    // Atualizar meeting se fornecido
    if (meetingId) {
      await supabase
        .from('meetings')
        .update({
          meeting_url: googleEvent.conferenceData?.entryPoints?.[0]?.uri,
          status: 'scheduled',
        })
        .eq('id', meetingId)
    }

    return NextResponse.json({
      success: true,
      googleEvent,
      calendarEvent,
    })
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
