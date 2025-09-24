import { test, expect } from '@playwright/test'

// Mock de usuário admin para testes
const mockAdminUser = {
  email: 'admin@test.com',
  password: 'testpassword123',
  role: 'admin'
}

const mockConsultorUser = {
  email: 'consultor@test.com',
  password: 'testpassword123',
  role: 'consultor'
}

test.describe('Dashboard - Layout e Navegação', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação bem-sucedida
    await page.goto('/auth/login')
    
    // Simular login (ajustar conforme implementação real)
    await page.evaluate(() => {
      // Mock do localStorage ou sessionStorage se necessário
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-admin-id',
          email: 'admin@test.com',
          user_metadata: { name: 'Admin Test' }
        }
      }))
    })
    
    await page.goto('/dashboard')
  })

  test('deve carregar dashboard sem erros', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard')
    
    // Verificar se não há erros de JavaScript
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('deve mostrar sidebar fixa', async ({ page }) => {
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    await expect(sidebar).toHaveClass(/fixed/)
    
    // Verificar logo
    await expect(page.locator('aside h1')).toContainText('CRM LDC')
  })

  test('deve mostrar header com busca e menu usuário', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Verificar barra de busca
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible()
    
    // Verificar menu do usuário
    await expect(page.locator('button').filter({ hasText: /Admin|Usuário/ })).toBeVisible()
  })

  test('deve ser responsivo - sidebar colapsível', async ({ page }) => {
    // Encontrar botão de colapsar
    const collapseButton = page.locator('button[title*="sidebar"], button[title*="Expandir"], button[title*="Recolher"]')
    await expect(collapseButton).toBeVisible()
    
    // Clicar para colapsar
    await collapseButton.click()
    
    // Verificar se sidebar foi colapsada (largura reduzida)
    const sidebar = page.locator('aside')
    await expect(sidebar).toHaveClass(/w-16/)
  })

  test('deve navegar entre páginas da sidebar', async ({ page }) => {
    // Testar navegação para Manual
    await page.click('text=Manual')
    await expect(page).toHaveURL('/dashboard/manual')
    
    // Voltar ao dashboard
    await page.click('text=Dashboard')
    await expect(page).toHaveURL('/dashboard')
  })

  test('deve mostrar menu do usuário com opções', async ({ page }) => {
    // Clicar no avatar/nome do usuário
    const userButton = page.locator('button').filter({ hasText: /Admin|Test|Usuário/ }).first()
    await userButton.click()
    
    // Verificar dropdown
    await expect(page.locator('text=Meu Perfil')).toBeVisible()
    await expect(page.locator('text=Configurações')).toBeVisible()
    await expect(page.locator('text=Sair')).toBeVisible()
  })

  test('deve fazer logout corretamente', async ({ page }) => {
    // Abrir menu do usuário
    const userButton = page.locator('button').filter({ hasText: /Admin|Test|Usuário/ }).first()
    await userButton.click()
    
    // Clicar em Sair
    await page.click('text=Sair')
    
    // Deve redirecionar para login
    await expect(page).toHaveURL('/auth/login')
  })
})

test.describe('Dashboard - Conteúdo Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de admin autenticado
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'admin')
    })
    await page.reload()
  })

  test('deve mostrar componentes específicos de admin', async ({ page }) => {
    // Verificar se botões de admin estão visíveis
    await expect(page.locator('button', { hasText: 'Import' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Atribuir' })).toBeVisible()
    
    // Verificar se página de usuários está na sidebar (admin only)
    await expect(page.locator('text=Usuários')).toBeVisible()
  })

  test('deve mostrar kanban board com todas as colunas', async ({ page }) => {
    // Verificar colunas do kanban
    await expect(page.locator('text=Lead Qualificado')).toBeVisible()
    await expect(page.locator('text=R1 Agendada')).toBeVisible()
    await expect(page.locator('text=R2 + Proposta')).toBeVisible()
    await expect(page.locator('text=Cliente Assinado')).toBeVisible()
  })
})

test.describe('Dashboard - Conteúdo Consultor', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de consultor autenticado
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'consultor')
    })
    await page.reload()
  })

  test('deve ocultar funcionalidades de admin', async ({ page }) => {
    // Verificar se botões de admin NÃO estão visíveis
    await expect(page.locator('button', { hasText: 'Import' })).not.toBeVisible()
    await expect(page.locator('button', { hasText: 'Atribuir' })).not.toBeVisible()
    
    // Verificar se página de usuários NÃO está na sidebar
    await expect(page.locator('text=Usuários')).not.toBeVisible()
  })

  test('deve mostrar estatísticas do consultor', async ({ page }) => {
    // Verificar cards de estatísticas
    await expect(page.locator('text=Meus Leads')).toBeVisible()
    await expect(page.locator('text=Tarefas Pendentes')).toBeVisible()
    await expect(page.locator('text=Taxa de Conversão')).toBeVisible()
  })

  test('deve mostrar apenas botão de export', async ({ page }) => {
    // Consultor deve poder exportar seus próprios leads
    await expect(page.locator('button', { hasText: 'Exportar' })).toBeVisible()
  })
})
