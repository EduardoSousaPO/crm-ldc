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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
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
