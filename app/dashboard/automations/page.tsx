'use client'

import { Zap } from 'lucide-react'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export default function AutomationsPage() {
  return (
    <PlaceholderPage
      title="Automações N8N"
      description="Configure workflows inteligentes para otimizar processos"
      icon={Zap}
      features={[
        'Qualificação automática de leads',
        'Follow-up inteligente por WhatsApp',
        'Integração com Google Calendar',
        'Análise de sentimento por IA',
        'Distribuição automática de leads',
        'Notificações personalizadas',
        'Relatórios automatizados',
        'Webhooks e integrações'
      ]}
    />
  )
}