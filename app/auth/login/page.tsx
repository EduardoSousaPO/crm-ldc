'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { LDCLogo } from '@/components/LDCLogo'
import type { Database } from '@/types/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas. Verifique seu e-mail e senha.')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Por favor, confirme seu e-mail antes de fazer login.')
      } else {
        toast.error('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand - LDC Capital */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <LDCLogo size="lg" variant="icon" />
          </div>
          <h1 className="notion-title text-2xl font-semibold text-gray-900 mb-1">
            CRM - LDC Capital
          </h1>
          <p className="notion-body text-gray-500 text-sm">
            Faça login para continuar
          </p>
        </div>

        {/* Login Form - Estilo Notion Minimalista */}
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="notion-caption text-gray-600 mb-1 block text-sm">
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="notion-caption text-gray-600 mb-1 block text-sm">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links - Estilo Notion */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <Link
              href="/auth/forgot-password"
              className="notion-body text-gray-500 hover:text-gray-700 transition-colors text-sm block text-center"
            >
              Esqueceu sua senha?
            </Link>
            <div className="notion-body text-gray-500 text-sm text-center">
              Não tem uma conta?{' '}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="notion-caption text-gray-400 text-xs">
            © 2024 LDC Capital. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}