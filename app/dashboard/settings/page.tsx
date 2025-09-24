'use client'

import { Settings } from 'lucide-react'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Configurações do Sistema"
      description="Configure integrações, notificações e preferências"
      icon={Settings}
      features={[
        'Configurações de integração',
        'Tokens de API',
        'Notificações por email',
        'Webhooks personalizados',
        'Backup e restore',
        'Logs do sistema',
        'Configurações de segurança',
        'Personalização da interface'
      ]}
    />
  )
}