'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, MapPin, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface QuickAddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (leadData: any) => Promise<void>
  status: string
  statusTitle: string
}

const LEAD_ORIGINS = [
  { value: 'website', label: 'Website' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evento', label: 'Evento' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'email', label: 'E-mail' },
  { value: 'outros', label: 'Outros' },
]

const INVESTMENT_PROFILES = [
  { value: 'conservador', label: 'Conservador' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'arrojado', label: 'Arrojado' },
]

export function QuickAddLeadModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  status, 
  statusTitle 
}: QuickAddLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    origin: '',
    investment_profile: '',
    investment_amount: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast.error('E-mail ou telefone é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        origin: formData.origin || null,
        investment_profile: formData.investment_profile || null,
        investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : 0,
        notes: formData.notes.trim() || null,
        status: status, // Status específico da coluna
        score: 0,
      })

      toast.success('Lead adicionado com sucesso!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        origin: '',
        investment_profile: '',
        investment_amount: '',
        notes: '',
      })
      
      onClose()
    } catch (error) {
      console.error('Erro ao criar lead:', error)
      toast.error('Erro ao criar lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Adicionar Lead</h2>
              <p className="text-sm text-gray-600">Para: {statusTitle}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nome */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                Nome completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="joao@exemplo.com"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Origem */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Origem
              </label>
              <select
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Selecione a origem</option>
                {LEAD_ORIGINS.map((origin) => (
                  <option key={origin.value} value={origin.value}>
                    {origin.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Perfil de Investimento */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Perfil de Investimento
              </label>
              <select
                value={formData.investment_profile}
                onChange={(e) => handleInputChange('investment_profile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Selecione o perfil</option>
                {INVESTMENT_PROFILES.map((profile) => (
                  <option key={profile.value} value={profile.value}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor de Investimento */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Valor Disponível para Investimento (R$)
              </label>
              <input
                type="number"
                value={formData.investment_amount}
                onChange={(e) => handleInputChange('investment_amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                rows={3}
                placeholder="Informações adicionais sobre o lead..."
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adicionando...' : 'Adicionar Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



