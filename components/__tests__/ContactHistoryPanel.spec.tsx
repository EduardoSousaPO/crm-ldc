import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ContactHistoryPanel } from '../ContactHistoryPanel'
import { toast } from 'react-hot-toast'
import '@testing-library/jest-dom'

// Mock da função fetch global
global.fetch = jest.fn()

describe('ContactHistoryPanel', () => {
  const leadId = 'test-lead-id'
  const currentUserId = 'test-user-id'

  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks()
  })

  it('deve exibir uma mensagem de erro específica da API quando o fetch falha', async () => {
    // 1. Simular uma resposta de erro da API
    const errorMessage = 'Acesso negado pela política de segurança (RLS)'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    })

    // 2. Renderizar o componente
    render(
      <ContactHistoryPanel
        leadId={leadId}
        currentUserId={currentUserId}
      />
    )

    // 3. Aguardar a resolução da chamada da API e a exibição do erro
    await waitFor(() => {
      // 4. Verificar se o toast.error foi chamado com a mensagem específica
      expect(toast.error).toHaveBeenCalledWith(errorMessage)
    })

    // Verificar se o painel não está mais em estado de carregamento
    // e exibe um estado de erro ou vazio
    expect(
      screen.getByText('Nenhuma tentativa de contato registrada')
    ).toBeInTheDocument()
  })

  it('deve carregar e exibir o histórico de contatos com sucesso', async () => {
    // Simular uma resposta de sucesso da API
    const mockData = [
      {
        id: '1',
        created_at: new Date().toISOString(),
        contact_method: 'phone',
        status: 'not_answered',
        notes: 'Tentativa 1',
        user: { name: 'Consultor Teste' },
      },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    })

    render(
      <ContactHistoryPanel
        leadId={leadId}
        currentUserId={currentUserId}
      />
    )

    // Aguardar o carregamento e renderização dos dados
    await waitFor(() => {
      // Verificar se a nota da tentativa de contato está na tela
      expect(screen.getByText('Tentativa 1')).toBeInTheDocument()
    })

    // Garantir que o toast de erro NÃO foi chamado
    expect(toast.error).not.toHaveBeenCalled()
  })
})
