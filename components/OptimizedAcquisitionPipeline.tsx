'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Target, 
  Phone, 
  Calendar, 
  FileText, 
  Handshake, 
  Trophy,
  Plus,
  Filter,
  Search,
  BarChart3
} from 'lucide-react'
import { LeadQualificationModal } from './LeadQualificationModal'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type UserProfile = Database['public']['Tables']['users']['Row']

interface OptimizedAcquisitionPipelineProps {
  leads: Lead[]
  currentUserId: string
  currentUserRole: string
  consultors?: UserProfile[]
  onLeadUpdate?: () => void
}

// Pipeline otimizado baseado em melhores práticas
const OPTIMIZED_STAGES = [
  {
    id: 'lead_qualificado',
    title: 'Leads Qualificados',
    description: 'Leads prontos para qualificação BANT',
    icon: Target,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    actions: ['qualify', 'assign', 'nurture']
  },
  {
    id: 'contato_inicial',
    title: 'Contato Inicial',
    description: 'Primeiro contato realizado',
    icon: Phone,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    actions: ['call', 'email', 'schedule']
  },
  {
    id: 'reuniao_agendada',
    title: 'Discovery Agendado',
    description: 'Reunião de descoberta marcada',
    icon: Calendar,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    actions: ['prepare', 'confirm', 'reschedule']
  },
  {
    id: 'discovery_concluido',
    title: 'Discovery Completo',
    description: 'Necessidades mapeadas',
    icon: FileText,
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    actions: ['proposal', 'demo', 'followup']
  },
  {
    id: 'proposta_apresentada',
    title: 'Proposta Enviada',
    description: 'Proposta comercial apresentada',
    icon: FileText,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    actions: ['negotiate', 'adjust', 'close']
  },
  {
    id: 'em_negociacao',
    title: 'Em Negociação',
    description: 'Negociando termos e condições',
    icon: Handshake,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    actions: ['contract', 'approve', 'finalize']
  },
  {
    id: 'cliente_ativo',
    title: 'Cliente Ativo',
    description: 'Conversão realizada com sucesso',
    icon: Trophy,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    actions: ['onboard', 'upsell', 'referral']
  }
]

export function OptimizedAcquisitionPipeline({
  leads,
  currentUserId,
  currentUserRole,
  consultors = [],
  onLeadUpdate
}: OptimizedAcquisitionPipelineProps) {
  const [filteredLeads, setFilteredLeads] = useState(leads)
  const [selectedConsultor, setSelectedConsultor] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [qualificationModalOpen, setQualificationModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    let filtered = leads

    // Filtro por consultor
    if (selectedConsultor) {
      filtered = filtered.filter(lead => lead.consultant_id === selectedConsultor)
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      )
    }

    // Filtro por estágio
    if (selectedStage) {
      filtered = filtered.filter(lead => lead.status === selectedStage)
    }

    setFilteredLeads(filtered)
  }, [leads, selectedConsultor, searchTerm, selectedStage])

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.status === stageId)
  }

  const getStageStats = (stageId: string) => {
    const stageLeads = getLeadsByStage(stageId)
    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.score || 0), 0)
    return {
      count: stageLeads.length,
      totalValue: Math.round(totalValue),
      avgScore: stageLeads.length > 0 ? Math.round(totalValue / stageLeads.length) : 0
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const handleQualifyLead = (lead: Lead) => {
    setSelectedLead(lead)
    setQualificationModalOpen(true)
  }

  const getNextAction = (lead: Lead) => {
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(lead.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    switch (lead.status) {
      case 'lead_qualificado':
        return { action: 'Qualificar Lead', urgent: daysSinceUpdate > 2 }
      case 'contato_inicial':
        return { action: 'Agendar Discovery', urgent: daysSinceUpdate > 3 }
      case 'reuniao_agendada':
        return { action: 'Realizar Discovery', urgent: daysSinceUpdate > 1 }
      case 'discovery_concluido':
        return { action: 'Enviar Proposta', urgent: daysSinceUpdate > 5 }
      case 'proposta_apresentada':
        return { action: 'Follow-up Proposta', urgent: daysSinceUpdate > 7 }
      case 'em_negociacao':
        return { action: 'Fechar Negociação', urgent: daysSinceUpdate > 10 }
      default:
        return { action: 'Revisar', urgent: false }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pipeline de Aquisição Otimizado
            </h2>
            <p className="text-sm text-gray-600">
              Baseado em metodologia BANT e melhores práticas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredLeads.length} leads no pipeline
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedConsultor}
            onChange={(e) => setSelectedConsultor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os consultores</option>
            {consultors.map((consultor) => (
              <option key={consultor.id} value={consultor.id}>
                {consultor.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os estágios</option>
            {OPTIMIZED_STAGES.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {OPTIMIZED_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id)
          const stats = getStageStats(stage.id)
          const StageIcon = stage.icon

          return (
            <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Stage Header */}
              <div className={`p-4 ${stage.bgColor} border-b ${stage.borderColor}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${stage.color} text-white rounded-lg`}>
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${stage.textColor}`}>
                      {stage.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {stage.description}
                    </p>
                  </div>
                </div>
                
                {/* Stage Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 bg-white rounded border ${stage.borderColor}`}>
                    <div className="font-semibold text-gray-900">{stats.count}</div>
                    <div className="text-gray-600">Leads</div>
                  </div>
                  <div className={`p-2 bg-white rounded border ${stage.borderColor}`}>
                    <div className="font-semibold text-gray-900">{stats.avgScore}</div>
                    <div className="text-gray-600">Score Médio</div>
                  </div>
                </div>
              </div>

              {/* Stage Content */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <StageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum lead neste estágio</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const nextAction = getNextAction(lead)
                    const consultor = consultors.find(c => c.id === lead.consultant_id)
                    
                    return (
                      <div
                        key={lead.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {lead.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {lead.email}
                            </p>
                            {consultor && (
                              <p className="text-xs text-gray-500">
                                {consultor.name}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreColor(lead.score || 0)}`}>
                            {lead.score || 0}
                          </span>
                        </div>

                        {/* Next Action */}
                        <div className={`text-xs p-2 rounded border ${
                          nextAction.urgent ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          <div className="font-medium">{nextAction.action}</div>
                          <div className="text-gray-600">
                            {formatDistanceToNow(new Date(lead.updated_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-2 flex items-center space-x-2">
                          {stage.id === 'lead_qualificado' && (
                            <button
                              onClick={() => handleQualifyLead(lead)}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Qualificar
                            </button>
                          )}
                          <button className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Qualificação */}
      {qualificationModalOpen && selectedLead && (
        <LeadQualificationModal
          isOpen={qualificationModalOpen}
          onClose={() => {
            setQualificationModalOpen(false)
            setSelectedLead(null)
          }}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
          currentUserId={currentUserId}
          onQualificationComplete={() => {
            if (onLeadUpdate) onLeadUpdate()
          }}
        />
      )}
    </div>
  )
}
