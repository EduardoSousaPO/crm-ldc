'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { KuveraInspiredDashboard } from '@/components/KuveraInspiredDashboard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export default function KuveraDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  })
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Buscar estatísticas básicas
      let leadsQuery = (supabase as any).from('leads').select('*')
      
      if ((profile as any)?.role === 'consultor') {
        leadsQuery = leadsQuery.eq('consultant_id', user.id)
      }
      
      const { data: leads } = await leadsQuery

      if (leads) {
        const activeClients = leads.filter((lead: any) => lead.status === 'cliente_ativo').length
        const totalLeads = leads.length
        const conversionRate = totalLeads > 0 ? Math.round((activeClients / totalLeads) * 100) : 0
        
        setStats({
          totalLeads,
          activeClients,
          monthlyRevenue: activeClients * 5000, // Estimativa
          conversionRate
        })
      }

      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <KuveraInspiredDashboard
      userRole={userProfile.role as 'admin' | 'consultor'}
      userName={userProfile.name || user.email || 'Usuário'}
      stats={stats}
    />
  )
}
