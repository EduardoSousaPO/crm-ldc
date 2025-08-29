'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
        status: 'lead_qualification',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header - Estilo Notion */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="notion-title text-xl font-semibold text-gray-900">Novo Lead</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form - Estilo Notion */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="notion-caption text-gray-600 mb-1 block text-sm">
              Nome *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field w-full"
              placeholder="Nome completo do lead"
              required
            />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="notion-caption text-gray-600 mb-1 block text-sm">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field w-full"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="notion-caption text-gray-600 mb-1 block text-sm">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input-field w-full"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Origem */}
          <div>
            <label htmlFor="origin" className="notion-caption text-gray-600 mb-1 block text-sm">
              Origem
            </label>
            <select
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              className="input-field w-full"
            >
              <option value="">Selecione a origem</option>
              {LEAD_ORIGINS.map((origin) => (
                <option key={origin.value} value={origin.value}>
                  {origin.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="notes" className="notion-caption text-gray-600 mb-1 block text-sm">
              Observações
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input-field w-full h-20 resize-none"
              placeholder="Informações adicionais sobre o lead..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
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