'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { ManualInterativo } from '@/components/ManualInterativo'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export default function ManualPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          redirect('/auth/login')
          return
        }

        const { data: userProfile, error: profileError } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          redirect('/auth/login')
          return
        }

        setUser(userProfile)
      } catch (error) {
        console.error('Erro na autenticação:', error)
        redirect('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando manual...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ManualInterativo
      currentUserId={user.id}
      userRole={user.role as 'admin' | 'consultor'}
    />
  )
}
