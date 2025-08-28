'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']

interface NewLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (leadData: any) => Promise<void>
}

const LEAD_ORIGINS = [
  { value: 'website', label: 'Website' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evento', label: 'Evento' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'outros', label: 'Outros' },
]

export function NewLeadModal({ isOpen, onClose, onSubmit }: NewLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    origin: '',
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
        notes: formData.notes.trim() || null,
        status: 'lead_qualificado',
        consultant_id: '', // Será preenchido no componente pai
        score: 0,
      })

      toast.success('Lead criado com sucesso!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        origin: '',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Novo Lead</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="Nome completo do lead"
              required
            />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input-field"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Origem */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-300 mb-2">
              Origem
            </label>
            <select
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              className="input-field"
            >
              <option value="">Selecione a origem</option>
              {LEAD_ORIGINS.map(origin => (
                <option key={origin.value} value={origin.value}>
                  {origin.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
              Notas iniciais
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Informações adicionais sobre o lead..."
            />
          </div>

          {/* Footer */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Criando...</span>
                </div>
              ) : (
                'Criar Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
