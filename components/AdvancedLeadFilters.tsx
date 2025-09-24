'use client'

import { useState } from 'react'
import { Filter, X, Calendar, Phone, Mail, MessageCircle, Clock, AlertTriangle } from 'lucide-react'
import type { ContactMethod, ContactStatus, FollowUpPriority, LeadStatus } from '@/types/supabase'

interface FilterOptions {
  leadStatus?: LeadStatus[]
  contactStatus?: ContactStatus[]
  contactMethod?: ContactMethod[]
  priority?: FollowUpPriority[]
  lastContactDays?: number
  nextFollowUpDays?: number
  hasNoContact?: boolean
  needsFollowUp?: boolean
}

interface AdvancedLeadFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
}

const LEAD_STATUSES = [
  { value: 'lead_qualificado', label: 'Lead Qualificado', color: 'bg-blue-100 text-blue-800' },
  { value: 'contato_inicial', label: 'Contato Inicial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'reuniao_agendada', label: 'Reunião Agendada', color: 'bg-green-100 text-green-800' },
  { value: 'discovery_concluido', label: 'Discovery Concluído', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposta_apresentada', label: 'Proposta Apresentada', color: 'bg-orange-100 text-orange-800' },
  { value: 'em_negociacao', label: 'Em Negociação', color: 'bg-red-100 text-red-800' },
  { value: 'cliente_ativo', label: 'Cliente Ativo', color: 'bg-emerald-100 text-emerald-800' },
]

const CONTACT_STATUSES = [
  { value: 'not_answered', label: 'Não atendeu', icon: Phone, color: 'text-red-600' },
  { value: 'requested_callback', label: 'Pediu retorno', icon: Phone, color: 'text-yellow-600' },
  { value: 'meeting_scheduled', label: 'Reunião agendada', icon: Calendar, color: 'text-green-600' },
  { value: 'not_interested', label: 'Não interessado', icon: X, color: 'text-gray-600' },
  { value: 'converted', label: 'Convertido', icon: Calendar, color: 'text-emerald-600' },
  { value: 'busy_try_later', label: 'Ocupado', icon: Clock, color: 'text-orange-600' },
  { value: 'voicemail_left', label: 'Mensagem deixada', icon: Phone, color: 'text-blue-600' },
  { value: 'email_sent', label: 'Email enviado', icon: Mail, color: 'text-indigo-600' },
]

const CONTACT_METHODS = [
  { value: 'phone', label: 'Telefone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
]

const PRIORITIES = [
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'medium', label: 'Média', color: 'text-yellow-600' },
  { value: 'low', label: 'Baixa', color: 'text-green-600' },
]

export function AdvancedLeadFilters({ filters, onFiltersChange, onClearFilters }: AdvancedLeadFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null
  }).length

  const handleArrayFilterChange = <T,>(key: keyof FilterOptions, value: T, checked: boolean) => {
    const currentValues = (filters[key] as T[]) || []
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    
    onFiltersChange({
      ...filters,
      [key]: newValues.length > 0 ? newValues : undefined
    })
  }

  const handleSingleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          {/* Status do Lead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Lead
            </label>
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUSES.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.leadStatus || []).includes(status.value as LeadStatus)}
                    onChange={(e) => handleArrayFilterChange('leadStatus', status.value as LeadStatus, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status do Último Contato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Último Contato
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_STATUSES.map((status) => {
                const IconComponent = status.icon
                return (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.contactStatus || []).includes(status.value as ContactStatus)}
                      onChange={(e) => handleArrayFilterChange('contactStatus', status.value as ContactStatus, e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full ${status.color}`}>
                      <IconComponent className="w-3 h-3" />
                      {status.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Método de Contato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Contato Preferido
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => {
                const IconComponent = method.icon
                return (
                  <label key={method.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.contactMethod || []).includes(method.value as ContactMethod)}
                      onChange={(e) => handleArrayFilterChange('contactMethod', method.value as ContactMethod, e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 rounded-full text-gray-700">
                      <IconComponent className="w-3 h-3" />
                      {method.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade de Follow-up
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((priority) => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.priority || []).includes(priority.value as FollowUpPriority)}
                    onChange={(e) => handleArrayFilterChange('priority', priority.value as FollowUpPriority, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`px-2 py-1 text-xs font-medium bg-gray-100 rounded-full ${priority.color}`}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros de Tempo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Último Contato (dias atrás)
              </label>
              <select
                value={filters.lastContactDays || ''}
                onChange={(e) => handleSingleFilterChange('lastContactDays', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Qualquer período</option>
                <option value="1">Hoje</option>
                <option value="3">Últimos 3 dias</option>
                <option value="7">Última semana</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Último mês</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próximo Follow-up (em dias)
              </label>
              <select
                value={filters.nextFollowUpDays || ''}
                onChange={(e) => handleSingleFilterChange('nextFollowUpDays', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Qualquer período</option>
                <option value="0">Hoje</option>
                <option value="1">Amanhã</option>
                <option value="3">Próximos 3 dias</option>
                <option value="7">Próxima semana</option>
                <option value="15">Próximos 15 dias</option>
                <option value="30">Próximo mês</option>
              </select>
            </div>
          </div>

          {/* Filtros Especiais */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasNoContact || false}
                onChange={(e) => handleSingleFilterChange('hasNoContact', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 text-sm text-gray-700">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Sem tentativas de contato
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.needsFollowUp || false}
                onChange={(e) => handleSingleFilterChange('needsFollowUp', e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-red-500" />
                Follow-up atrasado
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
