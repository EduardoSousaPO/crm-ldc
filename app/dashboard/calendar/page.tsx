'use client'

import { Calendar } from 'lucide-react'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export default function CalendarPage() {
  return (
    <PlaceholderPage
      title="Agenda Integrada"
      description="Gerencie reuniões e compromissos com leads"
      icon={Calendar}
      features={[
        'Sincronização com Google Calendar',
        'Agendamento automático de reuniões',
        'Lembretes inteligentes',
        'Zoom/Teams integrado',
        'Disponibilidade em tempo real',
        'Templates de reunião',
        'Histórico de compromissos',
        'Relatórios de produtividade'
      ]}
    />
  )
}
