'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-600 to-accent-700 rounded-2xl mb-4 shadow-lg shadow-accent-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CRM - LDC Capital</h1>
          <p className="text-gray-400 text-sm">
            Plataforma inteligente para consultores
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/25"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Esqueceu sua senha?
            </Link>
            <div className="text-gray-500 text-sm">
              Não tem uma conta?{' '}
              <Link
                href="/auth/register"
                className="text-accent-400 hover:text-accent-300 transition-colors font-medium"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 LDC Capital. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
