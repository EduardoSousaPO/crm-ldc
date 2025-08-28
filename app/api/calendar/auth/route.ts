import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    // Gerar URL de autorização do Google Calendar
    const authUrl = CalendarService.getAuthUrl()
    
    return NextResponse.json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error('Erro ao gerar URL de autorização:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
