'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import { KuveraKanbanBoard } from '@/components/KuveraKanbanBoard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type UserProfile = Database['public']['Tables']['users']['Row']

export default function KuveraKanbanPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function initializePage() {
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

      // Buscar leads baseado no papel do usuário
      let leadsQuery = supabase.from('leads').select('*')
      
      if ((profile as any)?.role === 'consultor') {
        leadsQuery = leadsQuery.eq('consultant_id', user.id)
      }
      
      const { data: leadsData, error } = await leadsQuery.order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erro ao buscar leads:', error)
        toast.error('Erro ao carregar leads')
      } else {
        setLeads(leadsData || [])
      }

      setLoading(false)
    }

    initializePage()
  }, [router, supabase])

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const { error } = await (supabase as any)
        .from('leads')
        .update(updates)
        .eq('id', leadId)

      if (error) throw error

      // Atualizar estado local
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ))

    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
      throw error
    }
  }

  const handleCreateLead = async (leadData: Partial<Lead>) => {
    try {
      const { data: newLead, error } = await (supabase as any)
        .from('leads')
        .insert({
          ...leadData,
          consultant_id: user?.id || '',
        })
        .select()
        .single()

      if (error) throw error

      setLeads(prev => [newLead, ...prev])
      toast.success('Lead criado com sucesso!')

    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <KuveraKanbanBoard
        leads={leads}
        onUpdateLead={handleUpdateLead}
        onCreateLead={handleCreateLead}
        userRole={userProfile.role as 'admin' | 'consultor'}
      />
    </div>
  )
}
