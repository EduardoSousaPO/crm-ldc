import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/lib/calendar'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // Pode conter userId
    const error = searchParams.get('error')

    if (error) {
      console.error('Erro na autorização Google:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar_error=access_denied`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar_error=no_code`
      )
    }

    // Extrair userId do state ou da sessão
    let userId = state
    
    if (!userId) {
      // Tentar obter da sessão atual
      const supabase = createSupabaseServiceClient()
      // Em produção, você precisaria implementar uma forma de vincular o callback à sessão
      // Por simplicidade, vamos redirecionar para uma página de configuração
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?calendar_code=${code}`
      )
    }

    // Processar callback
    const result = await CalendarService.handleCallback(code, userId)

    if (result.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar_success=true`
      )
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar_error=callback_failed`
      )
    }
  } catch (error) {
    console.error('Erro no callback do Google:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar_error=server_error`
    )
  }
}
