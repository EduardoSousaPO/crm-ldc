'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import type { Database } from '@/types/supabase'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success('Conta criada com sucesso! Verifique seu e-mail.')
        router.push('/auth/login')
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      
      if (error.message.includes('User already registered')) {
        toast.error('Este e-mail já está cadastrado.')
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('A senha deve ter pelo menos 6 caracteres.')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-400 text-sm">
            Junte-se à plataforma inteligente para consultores
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-500/25"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                <>
                  <span>Criar Conta</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <div className="text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <Link
                href="/auth/login"
                className="text-accent-400 hover:text-accent-300 transition-colors font-medium"
              >
                Fazer login
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
