'use client'

import { useEffect, useState, createContext } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { Sidebar } from '@/components/Sidebar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

// Context para compartilhar dados do usuário
export const DashboardContext = createContext<{
  user: User | null
  userProfile: UserProfile | null
}>({
  user: null,
  userProfile: null
})

// Previne pre-rendering no servidor
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session and user profile
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }
      
      setUser(session.user)
      
      // Buscar perfil do usuário
      const { data: profile, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        console.error('Error fetching user profile:', error)
        // Se não encontrou o perfil, criar um básico
        const { error: insertError } = await (supabase as any)
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            role: 'consultor' // padrão
          })
        
        if (!insertError) {
          setUserProfile({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            role: 'consultor',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } else {
        setUserProfile(profile)
      }
      
      setIsLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        setUser(session.user)
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  if (isLoading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DashboardContext.Provider value={{ user, userProfile }}>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar fixa em largura, NUNCA position: fixed aqui */}
        <aside className="w-64 shrink-0">
          <Sidebar userRole={userProfile.role || 'consultor'} />
        </aside>

        {/* Conteúdo ocupa o resto, sem container/mx-auto */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </DashboardContext.Provider>
  )
}
