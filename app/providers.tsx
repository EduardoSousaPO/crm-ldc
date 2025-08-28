'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createSupabaseClient } from '@/lib/supabase'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import type { Database } from '@/types/supabase'

// Theme Context
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}>({
  theme: 'dark',
  toggleTheme: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Sempre usar modo claro para LDC Capital
    const preferredTheme = 'light'
    
    setTheme(preferredTheme)
    document.documentElement.classList.remove('dark')
  }, [])

  const toggleTheme = () => {
    // Desabilitado - apenas modo claro
    return
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
