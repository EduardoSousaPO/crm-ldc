'use client'

import { Users } from 'lucide-react'
import { PlaceholderPage } from '@/components/PlaceholderPage'

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Gerenciamento de Usuários"
      description="Administre consultores, admins e permissões do sistema"
      icon={Users}
      features={[
        'Listar todos os usuários',
        'Criar novos usuários',
        'Editar perfis e roles',
        'Gerenciar permissões',
        'Histórico de atividades',
        'Integração com Active Directory',
        'Configuração de equipes',
        'Relatórios de performance'
      ]}
    />
  )
}