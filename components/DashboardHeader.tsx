'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Sparkles,
  Menu
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erro ao fazer logout:', error)
        toast.error('Erro ao fazer logout')
        return
      }

      toast.success('Logout realizado com sucesso')
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }

  const getUserInitials = (name: string | undefined, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-petroleum-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CRM - LDC Capital</h1>
              <p className="text-xs text-petroleum-600">Powered by AI</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar leads, tarefas..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-petroleum-500 focus:border-petroleum-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search - Mobile */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-petroleum-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user ? getUserInitials(user.user_metadata?.name, user.email!) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-petroleum-600">Consultor</p>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // TODO: Implementar página de perfil
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // TODO: Implementar página de configurações
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </button>
                    
                    <hr className="my-1 border-gray-100" />
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}