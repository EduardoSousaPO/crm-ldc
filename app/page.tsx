import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(cookieStore)
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
