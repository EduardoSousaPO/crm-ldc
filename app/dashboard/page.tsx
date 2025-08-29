'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { AdminDashboard } from '@/components/AdminDashboard'
import { ConsultorDashboard } from '@/components/ConsultorDashboard'
import { DashboardHeader } from '@/components/DashboardHeader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

// Previne pre-rendering no servidor
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <DashboardHeader user={user} />
      <main className="px-8 py-6">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {userProfile.role === 'admin' ? (
            <AdminDashboard currentUser={userProfile} />
          ) : (
            <ConsultorDashboard currentUser={userProfile} />
          )}
        </div>
      </main>
    </div>
  )
}