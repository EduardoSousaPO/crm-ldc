'use client'

import { FileText } from 'lucide-react'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export default function ReportsPage() {
  return (
    <PlaceholderPage
      title="Relatórios e Analytics"
      description="Análise completa de performance e métricas"
      icon={FileText}
      features={[
        'Dashboard executivo',
        'Funil de vendas detalhado',
        'Performance por consultor',
        'Análise de conversão',
        'ROI por origem de lead',
        'Previsões de vendas',
        'Relatórios customizáveis',
        'Exportação para Excel/PDF'
      ]}
    />
  )
}
