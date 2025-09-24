'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSidebar } from '@/contexts/SidebarContext'
import { createSupabaseClient } from '@/lib/supabase'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Calendar,
  FileText,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SidebarProps {
  userRole: string
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  path: string
  adminOnly?: boolean
  featureFlag?: string
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    path: '/dashboard'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    path: '/dashboard/users',
    adminOnly: true,
    featureFlag: 'FEATURE_USERS'
  },
  {
    id: 'automations',
    label: 'Automações',
    icon: Zap,
    path: '/dashboard/automations',
    featureFlag: 'FEATURE_AUTOMATIONS'
  },
  {
    id: 'calendar',
    label: 'Agenda',
    icon: Calendar,
    path: '/dashboard/calendar',
    featureFlag: 'FEATURE_CALENDAR'
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    path: '/dashboard/reports',
    featureFlag: 'FEATURE_REPORTS'
  },
  {
    id: 'manual',
    label: 'Manual',
    icon: BookOpen,
    path: '/dashboard/manual'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/dashboard/settings',
    featureFlag: 'FEATURE_SETTINGS'
  }
]

export function Sidebar({ userRole }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrar itens baseado no role e feature flags
  const visibleItems = MENU_ITEMS.filter(item => {
    // Verificar se é admin-only
    if (item.adminOnly && userRole !== 'admin') {
      return false
    }

    // Verificar feature flag
    if (item.featureFlag) {
      const isEnabled = process.env[`NEXT_PUBLIC_${item.featureFlag}`] === 'true'
      if (!isEnabled) {
        return false
      }
    }

    return true
  })

  const handleNavigation = (path: string) => {
    router.push(path)
  }

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

  return (
    <div 
      className={`
        h-screen text-white border-r
        transition-all duration-300 ease-in-out sticky top-0
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      style={{
        backgroundColor: '#000000', // Preto
        borderColor: '#333333'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: '#333333' }}
      >
        <div className={`flex flex-col items-center gap-1 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="w-40 h-28 relative">
            <Image
              src="/ldc-logo-white.png"
              alt="LDC Capital Logo"
              fill
              style={{ objectFit: 'contain' }}
              className="filter brightness-0 invert"
            />
          </div>
          <div className="text-center">
            <h1 className="font-normal text-xs" style={{ color: '#FFFFFF', fontWeight: '500' }}>CRM</h1>
          </div>
        </div>
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md transition-colors"
          style={{
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#333333'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-colors duration-200
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  style={{
                    backgroundColor: isActive ? '#3B82F6' : 'transparent',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.target as HTMLElement).style.backgroundColor = '#333333'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.target as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer - User Menu */}
      <div className="absolute bottom-4 left-4 right-4">
        {!isCollapsed ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full rounded-lg p-3 border transition-colors"
              style={{
                backgroundColor: '#333333',
                borderColor: '#555555'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#555555'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#333333'}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    userRole === 'admin' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-xs" style={{ color: '#FFFFFF' }}>
                    {userRole === 'admin' ? 'Administrador' : 'Consultor'}
                  </span>
                </div>
                <UserIcon className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </div>
            </button>
            
            {/* Menu Dropdown */}
            {showUserMenu && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border shadow-lg"
                style={{
                  backgroundColor: '#333333',
                  borderColor: '#555555'
                }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full p-3 text-left rounded-lg transition-colors flex items-center gap-2 text-red-400"
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#555555';
                    (e.target as HTMLElement).style.color = '#FCA5A5'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLElement).style.color = '#F87171'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full p-2 rounded-lg border transition-colors flex items-center justify-center"
            style={{
              backgroundColor: '#333333',
              borderColor: '#555555'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#555555'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#333333'}
            title="Sair"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  )
}
