'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand - Estilo Notion */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
            <div className="w-6 h-6 bg-gray-800 rounded-sm"></div>
          </div>
          <h1 className="notion-title text-2xl font-semibold text-gray-900 mb-1">
            Criar Conta
          </h1>
          <p className="notion-body text-gray-500 text-sm">
            Junte-se à plataforma LDC Capital
          </p>
        </div>

        {/* Register Form - Estilo Notion Minimalista */}
        <div className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="notion-caption text-gray-600 mb-1 block text-sm">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="notion-caption text-gray-600 mb-1 block text-sm">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                placeholder="Digite seu e-mail"
                required
              />
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="notion-caption text-gray-600 mb-1 block text-sm">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="input-field w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Criar Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links - Estilo Notion */}
          <div className="pt-4 border-t border-gray-100">
            <div className="notion-body text-gray-500 text-sm text-center">
              Já tem uma conta?{' '}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Fazer login
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