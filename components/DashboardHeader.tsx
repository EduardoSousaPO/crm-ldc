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
  Menu
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LDCIcon } from '@/components/LDCLogo'
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo - LDC Capital */}
          <div className="flex items-center gap-2">
            <LDCIcon size={24} className="flex-shrink-0" />
            <div>
              <h1 className="notion-subtitle font-medium text-gray-900">CRM - LDC Capital</h1>
            </div>
          </div>

          {/* Search Bar - Desktop Notion Style */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar leads, tarefas..."
                className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Actions - Estilo Notion */}
          <div className="flex items-center gap-1">
            {/* Search - Mobile */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors">
              <Search className="w-4 h-4 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-md transition-colors relative">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu - Estilo Notion */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {user ? getUserInitials(user.user_metadata?.name, user.email!) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="notion-caption text-gray-700 text-sm">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                </div>
              </button>

              {/* User Dropdown - Estilo Notion */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="notion-subtitle text-gray-900 text-sm">
                        {user?.user_metadata?.name || 'Usuário'}
                      </p>
                      <p className="notion-caption text-gray-500 text-xs truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // TODO: Implementar página de perfil
                      }}
                      className="w-full px-3 py-2 text-left notion-body text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // TODO: Implementar página de configurações
                      }}
                      className="w-full px-3 py-2 text-left notion-body text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                      className="w-full px-3 py-2 text-left notion-body text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors">
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}