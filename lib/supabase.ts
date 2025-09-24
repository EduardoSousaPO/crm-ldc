import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Cliente para uso em componentes client-side
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyexanwlwzdzceilxhhm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build'
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Cliente para uso em componentes server-side
export const createSupabaseServerClient = (cookieStore: any) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyexanwlwzdzceilxhhm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build'
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Cliente para uso em Edge Functions e Server Actions
export const createSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyexanwlwzdzceilxhhm.supabase.co'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZXhhbndsd3pkemNlaWx4aGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTU5NywiZXhwIjoyMDcxODA3NTk3fQ.8cRBHfmqFn4oke3-IIJweyodSs8RXg3Q2LWtNlJPMwM'
  
  if (!supabaseServiceKey || supabaseServiceKey === 'dummy-key') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Configurações do Supabase
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

// Tipos úteis
export type SupabaseClient = ReturnType<typeof createSupabaseClient>
export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>
export type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>
