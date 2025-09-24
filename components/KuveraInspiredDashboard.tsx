'use client'

import { useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus
} from 'lucide-react'

interface DashboardProps {
  userRole?: 'admin' | 'consultor'
  userName?: string
  stats?: {
    totalLeads: number
    activeClients: number
    monthlyRevenue: number
    conversionRate: number
  }
}

export function KuveraInspiredDashboard({ 
  userRole = 'consultor', 
  userName = 'Usuário',
  stats = {
    totalLeads: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  }
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const calculatorCards = [
    {
      title: 'Gestão de Leads',
      description: 'Gerencie e qualifique seus leads de forma eficiente com nosso sistema Kanban inteligente.',
      icon: <Users className="w-6 h-6" />,
      action: 'Acessar Pipeline',
      href: '/dashboard'
    },
    {
      title: 'Análise de Performance',
      description: 'Acompanhe métricas de conversão, receita e performance de vendas em tempo real.',
      icon: <BarChart3 className="w-6 h-6" />,
      action: 'Ver Relatórios',
      href: '/dashboard/reports'
    },
    {
      title: 'Calendário de Reuniões',
      description: 'Agende e gerencie reuniões com clientes de forma integrada ao seu pipeline.',
      icon: <Calendar className="w-6 h-6" />,
      action: 'Abrir Calendário',
      href: '/dashboard/calendar'
    },
    {
      title: 'Metas e Objetivos',
      description: 'Defina e acompanhe suas metas de vendas e objetivos mensais de conversão.',
      icon: <Target className="w-6 h-6" />,
      action: 'Configurar Metas',
      href: '/dashboard/goals'
    },
    {
      title: 'Calculadora de ROI',
      description: 'Calcule o retorno sobre investimento para diferentes estratégias de captação.',
      icon: <TrendingUp className="w-6 h-6" />,
      action: 'Calcular ROI',
      href: '/dashboard/calculator'
    },
    {
      title: 'Automações Inteligentes',
      description: 'Configure automações para follow-ups, tarefas e notificações de oportunidades.',
      icon: <CheckCircle className="w-6 h-6" />,
      action: 'Ver Automações',
      href: '/dashboard/automations'
    }
  ]

  const recentActivities = [
    { type: 'lead', message: 'Novo lead qualificado: João Silva', time: '2 min atrás' },
    { type: 'meeting', message: 'Reunião agendada com Maria Santos', time: '15 min atrás' },
    { type: 'conversion', message: 'Lead convertido: Pedro Costa', time: '1h atrás' },
    { type: 'task', message: 'Tarefa concluída: Follow-up Ana Lima', time: '2h atrás' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Kuvera Style */}
      <nav className="kuvera-nav">
        <div className="kuvera-container">
          <div className="kuvera-nav-container">
            <a href="/" className="kuvera-nav-brand">
              CRM LDC Capital
            </a>
            <div className="kuvera-nav-links">
              <a 
                href="/dashboard" 
                className={`kuvera-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Dashboard
              </a>
              <a 
                href="/dashboard/leads" 
                className={`kuvera-nav-link ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
              >
                Pipeline
              </a>
              <a 
                href="/dashboard/reports" 
                className={`kuvera-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                Relatórios
              </a>
              <button className="kuvera-btn kuvera-btn-primary">
                <Plus className="w-4 h-4" />
                Novo Lead
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="kuvera-container kuvera-section-lg">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="kuvera-heading-xl mb-4">
            Bem-vindo, {userName}
          </h1>
          <p className="kuvera-body-lg text-center max-w-2xl mx-auto">
            Gerencie seus leads, acompanhe performance e maximize suas conversões com nossa plataforma completa de CRM para consultoria em investimentos.
          </p>
        </div>

        {/* Stats Section - Kuvera Style */}
        <div className="kuvera-stats mb-12">
          <div className="kuvera-stat">
            <div className="kuvera-stat-value">{stats.totalLeads}</div>
            <div className="kuvera-stat-label">Total de Leads</div>
          </div>
          <div className="kuvera-stat">
            <div className="kuvera-stat-value">{stats.activeClients}</div>
            <div className="kuvera-stat-label">Clientes Ativos</div>
          </div>
          <div className="kuvera-stat">
            <div className="kuvera-stat-value">
              {stats.monthlyRevenue.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <div className="kuvera-stat-label">Receita Mensal</div>
          </div>
          <div className="kuvera-stat">
            <div className="kuvera-stat-value">{stats.conversionRate}%</div>
            <div className="kuvera-stat-label">Taxa de Conversão</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="kuvera-grid kuvera-grid-3 mb-12">
          {calculatorCards.map((card, index) => (
            <div key={index} className="kuvera-card">
              <div className="kuvera-card-header">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {card.icon}
                  </div>
                  <h3 className="kuvera-card-title">{card.title}</h3>
                </div>
                <p className="kuvera-card-description">
                  {card.description}
                </p>
              </div>
              <div className="kuvera-card-footer">
                <a 
                  href={card.href}
                  className="kuvera-btn kuvera-btn-secondary"
                >
                  {card.action}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="kuvera-grid kuvera-grid-2">
          <div className="kuvera-card">
            <div className="kuvera-card-header">
              <h3 className="kuvera-card-title">Atividades Recentes</h3>
              <p className="kuvera-card-description">
                Acompanhe as últimas atividades do seu pipeline
              </p>
            </div>
            <div className="kuvera-card-content">
              <div className="kuvera-space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <span className="kuvera-body">{activity.message}</span>
                    </div>
                    <span className="kuvera-body-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="kuvera-card-footer">
              <a href="/dashboard/activity" className="kuvera-btn kuvera-btn-ghost">
                Ver todas as atividades
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="kuvera-card">
            <div className="kuvera-card-header">
              <h3 className="kuvera-card-title">Próximas Tarefas</h3>
              <p className="kuvera-card-description">
                Suas tarefas prioritárias para hoje
              </p>
            </div>
            <div className="kuvera-card-content">
              <div className="kuvera-space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="kuvera-body font-medium">Follow-up com cliente</div>
                    <div className="kuvera-body-sm">Vence em 2 horas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="kuvera-body font-medium">Reunião R1 - Maria</div>
                    <div className="kuvera-body-sm">Hoje às 15:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <div>
                    <div className="kuvera-body font-medium">Preparar proposta</div>
                    <div className="kuvera-body-sm">Vence amanhã</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="kuvera-card-footer">
              <a href="/dashboard/tasks" className="kuvera-btn kuvera-btn-ghost">
                Ver todas as tarefas
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gray-50 rounded-lg">
          <h2 className="kuvera-heading-md mb-4">
            Pronto para maximizar suas conversões?
          </h2>
          <p className="kuvera-body mb-6 max-w-lg mx-auto">
            Comece a usar nosso pipeline inteligente e transforme leads em clientes de forma mais eficiente.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/dashboard" className="kuvera-btn kuvera-btn-primary">
              Acessar Pipeline
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/dashboard/manual" className="kuvera-btn kuvera-btn-secondary">
              Ver Manual
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}



