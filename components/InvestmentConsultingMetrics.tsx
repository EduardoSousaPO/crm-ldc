'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Database } from '@/types/supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

interface InvestmentConsultingMetricsProps {
  leads: Lead[]
  tasks?: Task[]
  currentUserRole: string
  consultorId?: string
}

interface MetricData {
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  label: string
  description: string
}

interface ConversionFunnel {
  stage: string
  count: number
  percentage: number
  conversionRate: number
}

export function InvestmentConsultingMetrics({ 
  leads, 
  tasks = [], 
  currentUserRole,
  consultorId 
}: InvestmentConsultingMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({})
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([])

  useEffect(() => {
    calculateMetrics()
  }, [leads, tasks, selectedPeriod])

  const calculateMetrics = () => {
    const now = new Date()
    let currentPeriodStart: Date
    let previousPeriodStart: Date
    let previousPeriodEnd: Date

    switch (selectedPeriod) {
      case 'month':
        currentPeriodStart = startOfMonth(now)
        previousPeriodStart = startOfMonth(subMonths(now, 1))
        previousPeriodEnd = endOfMonth(subMonths(now, 1))
        break
      case 'quarter':
        currentPeriodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        previousPeriodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1)
        previousPeriodEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0)
        break
      case 'year':
        currentPeriodStart = new Date(now.getFullYear(), 0, 1)
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1)
        previousPeriodEnd = new Date(now.getFullYear() - 1, 11, 31)
        break
    }

    // Filtrar leads por período
    const currentLeads = leads.filter(lead => 
      new Date(lead.created_at || Date.now()) >= currentPeriodStart
    )
    const previousLeads = leads.filter(lead => 
      new Date(lead.created_at || Date.now()) >= previousPeriodStart && 
      new Date(lead.created_at || Date.now()) <= previousPeriodEnd
    )

    // Calcular métricas específicas para consultoria de investimentos
    const calculatedMetrics: Record<string, MetricData> = {
      totalLeads: {
        value: currentLeads.length,
        previousValue: previousLeads.length,
        change: 0,
        trend: 'stable',
        label: 'Total de Leads',
        description: 'Novos leads captados no período'
      },
      qualifiedLeads: {
        value: currentLeads.filter(lead => (lead.score || 0) >= 60).length,
        previousValue: previousLeads.filter(lead => (lead.score || 0) >= 60).length,
        change: 0,
        trend: 'stable',
        label: 'Leads Qualificados',
        description: 'Leads com score ≥ 60 pontos'
      },
      hotLeads: {
        value: currentLeads.filter(lead => (lead.score || 0) >= 80).length,
        previousValue: previousLeads.filter(lead => (lead.score || 0) >= 80).length,
        change: 0,
        trend: 'stable',
        label: 'Leads HOT',
        description: 'Leads com alta probabilidade de conversão'
      },
      conversions: {
        value: currentLeads.filter(lead => lead.status === 'cliente_ativo').length,
        previousValue: previousLeads.filter(lead => lead.status === 'cliente_ativo').length,
        change: 0,
        trend: 'stable',
        label: 'Conversões',
        description: 'Leads convertidos em clientes'
      },
      conversionRate: {
        value: currentLeads.length > 0 ? (currentLeads.filter(lead => lead.status === 'cliente_ativo').length / currentLeads.length) * 100 : 0,
        previousValue: previousLeads.length > 0 ? (previousLeads.filter(lead => lead.status === 'cliente_ativo').length / previousLeads.length) * 100 : 0,
        change: 0,
        trend: 'stable',
        label: 'Taxa de Conversão',
        description: 'Percentual de leads convertidos'
      },
      avgScore: {
        value: currentLeads.length > 0 ? currentLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / currentLeads.length : 0,
        previousValue: previousLeads.length > 0 ? previousLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / previousLeads.length : 0,
        change: 0,
        trend: 'stable',
        label: 'Score Médio',
        description: 'Score médio de qualificação'
      },
      avgCycleTime: {
        value: calculateAvgCycleTime(currentLeads),
        previousValue: calculateAvgCycleTime(previousLeads),
        change: 0,
        trend: 'stable',
        label: 'Ciclo Médio (dias)',
        description: 'Tempo médio lead → cliente'
      },
      activeTasks: {
        value: tasks.filter(task => task.status === 'pending').length,
        previousValue: 0,
        change: 0,
        trend: 'stable',
        label: 'Tarefas Ativas',
        description: 'Tarefas pendentes de execução'
      }
    }

    // Calcular mudanças e tendências
    Object.keys(calculatedMetrics).forEach(key => {
      const metric = calculatedMetrics[key]
      if (metric.previousValue > 0) {
        metric.change = ((metric.value - metric.previousValue) / metric.previousValue) * 100
        metric.trend = metric.change > 5 ? 'up' : metric.change < -5 ? 'down' : 'stable'
      } else {
        metric.change = metric.value > 0 ? 100 : 0
        metric.trend = metric.value > 0 ? 'up' : 'stable'
      }
    })

    setMetrics(calculatedMetrics)

    // Calcular funil de conversão
    const stages = [
      'lead_qualificado',
      'contato_inicial', 
      'reuniao_agendada',
      'discovery_concluido',
      'proposta_apresentada',
      'em_negociacao',
      'cliente_ativo'
    ]

    const funnel = stages.map((stage, index) => {
      const stageLeads = leads.filter(lead => lead.status === stage)
      const totalLeads = leads.length
      const previousStageLeads = index > 0 ? leads.filter(lead => stages.indexOf(lead.status || 'lead_qualificado') >= index - 1).length : totalLeads
      
      return {
        stage: getStageLabel(stage),
        count: stageLeads.length,
        percentage: totalLeads > 0 ? (stageLeads.length / totalLeads) * 100 : 0,
        conversionRate: previousStageLeads > 0 ? (stageLeads.length / previousStageLeads) * 100 : 0
      }
    })

    setConversionFunnel(funnel)
  }

  const calculateAvgCycleTime = (leadsData: Lead[]) => {
    const convertedLeads = leadsData.filter(lead => lead.status === 'cliente_ativo')
    if (convertedLeads.length === 0) return 0

    const totalDays = convertedLeads.reduce((sum, lead) => {
      const createdDate = new Date(lead.created_at || Date.now())
      const updatedDate = new Date(lead.updated_at || lead.created_at || Date.now())
      const diffTime = Math.abs(updatedDate.getTime() - createdDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return sum + diffDays
    }, 0)

    return Math.round(totalDays / convertedLeads.length)
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'lead_qualificado': 'Lead Qualificado',
      'contato_inicial': 'Contato Inicial',
      'reuniao_agendada': 'Discovery Agendado',
      'discovery_concluido': 'Discovery Completo',
      'proposta_apresentada': 'Proposta Enviada',
      'em_negociacao': 'Em Negociação',
      'cliente_ativo': 'Cliente Ativo'
    }
    return labels[stage] || stage
  }

  const getMetricIcon = (key: string) => {
    const icons: Record<string, any> = {
      totalLeads: Users,
      qualifiedLeads: Target,
      hotLeads: AlertTriangle,
      conversions: CheckCircle,
      conversionRate: TrendingUp,
      avgScore: Award,
      avgCycleTime: Clock,
      activeTasks: Calendar
    }
    return icons[key] || TrendingUp
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      default: return null
    }
  }

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Métricas de Performance
          </h2>
          <p className="text-sm text-gray-600">
            Indicadores otimizados para consultoria de investimentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(metrics).map(([key, metric]) => {
          const Icon = getMetricIcon(key)
          const TrendIcon = getTrendIcon(metric.trend)
          const isPercentage = key === 'conversionRate'
          const isScore = key === 'avgScore'
          
          return (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                {TrendIcon && (
                  <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.change)}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {isPercentage ? `${metric.value.toFixed(1)}%` : 
                   isScore ? metric.value.toFixed(1) : 
                   Math.round(metric.value).toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {metric.label}
                </p>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Funil de Conversão */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Funil de Conversão
        </h3>
        
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    {stage.stage}
                  </span>
                  <span className="text-xs text-gray-500">
                    {stage.count} leads
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {stage.percentage.toFixed(1)}%
                  </span>
                  {index > 0 && (
                    <span className="text-xs text-blue-600">
                      Conv: {stage.conversionRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
              
              {index < conversionFunnel.length - 1 && (
                <div className="flex justify-center mt-2">
                  <ArrowDown className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Insights e Recomendações
        </h3>
        
        <div className="space-y-3">
          {metrics.conversionRate?.value < 10 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Taxa de conversão baixa
                </p>
                <p className="text-xs text-red-600">
                  Revisar processo de qualificação e follow-up
                </p>
              </div>
            </div>
          )}
          
          {metrics.avgScore?.value < 50 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Score médio abaixo do ideal
                </p>
                <p className="text-xs text-yellow-600">
                  Focar em leads com maior potencial de conversão
                </p>
              </div>
            </div>
          )}
          
          {metrics.avgCycleTime?.value > 45 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Ciclo de vendas longo
                </p>
                <p className="text-xs text-blue-600">
                  Otimizar processo de discovery e proposta
                </p>
              </div>
            </div>
          )}
          
          {metrics.activeTasks?.value > 20 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Muitas tarefas pendentes
                </p>
                <p className="text-xs text-purple-600">
                  Priorizar tarefas críticas e delegar quando possível
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
