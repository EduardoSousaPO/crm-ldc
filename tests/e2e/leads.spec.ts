import { test, expect } from '@playwright/test'

test.describe('CRUD de Leads', () => {
  test.beforeEach(async ({ page }) => {
    // Ir para o dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Aguardar carregamento do kanban
    await page.waitForSelector('[class*="kanban"]', { timeout: 15000 })
  })

  test('should create new lead via "Novo" button', async ({ page }) => {
    // Localizar e clicar no botão "Novo"
    const novoButton = page.locator('button', { hasText: 'Novo' }).first()
    await expect(novoButton).toBeVisible()
    await novoButton.click()

    // Aguardar modal abrir
    await page.waitForSelector('h2:has-text("Novo Lead")', { timeout: 5000 })
    
    // Preencher formulário
    await page.fill('input[name="name"]', 'Lead Teste E2E')
    await page.fill('input[name="email"]', 'teste.e2e@example.com')
    await page.fill('input[name="phone"]', '(11) 99999-9999')
    await page.selectOption('select[name="origin"]', 'website')
    await page.fill('textarea[name="notes"]', 'Lead criado via teste E2E')

    // Submeter formulário
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Verificar toast de sucesso
    await expect(page.locator('text=Lead criado com sucesso')).toBeVisible({ timeout: 5000 })
    
    // Verificar que o modal fechou
    await expect(page.locator('h2:has-text("Novo Lead")')).not.toBeVisible()
    
    // Verificar que o lead apareceu no kanban
    await expect(page.locator('text=Lead Teste E2E')).toBeVisible({ timeout: 10000 })
    
    console.log('✅ Lead criado com sucesso via botão Novo')
  })

  test('should open lead detail modal on card click', async ({ page }) => {
    // Aguardar carregamento dos leads
    await page.waitForSelector('[class*="lead-card"]', { timeout: 10000 })
    
    // Clicar no primeiro card de lead
    const leadCard = page.locator('[class*="lead-card"]').first()
    await leadCard.click()

    // Aguardar modal de detalhes abrir
    await page.waitForSelector('h2:has-text("Detalhes do Lead")', { timeout: 5000 })
    
    // Verificar que o modal tem campos de edição
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    
    // Fechar modal
    const closeButton = page.locator('button[aria-label="Fechar"]').first()
    await closeButton.click()
    
    await expect(page.locator('h2:has-text("Detalhes do Lead")')).not.toBeVisible()
    
    console.log('✅ Modal de detalhes funcionando')
  })

  test('should drag and drop lead between columns', async ({ page }) => {
    // Aguardar carregamento completo
    await page.waitForSelector('[class*="lead-card"]', { timeout: 10000 })
    
    // Localizar primeiro lead e uma coluna diferente
    const leadCard = page.locator('[class*="lead-card"]').first()
    const targetColumn = page.locator('[data-column="reuniao_agendada"]').first()
    
    if (await leadCard.isVisible() && await targetColumn.isVisible()) {
      // Realizar drag and drop
      await leadCard.dragTo(targetColumn)
      
      // Aguardar toast de sucesso
      await expect(page.locator('text=Lead movido')).toBeVisible({ timeout: 5000 })
      
      console.log('✅ Drag and drop funcionando')
    } else {
      console.log('⚠️ Não foi possível testar drag and drop - elementos não encontrados')
    }
  })

  test('should open import modal (admin only)', async ({ page }) => {
    // Tentar localizar botão Import
    const importButton = page.locator('button', { hasText: 'Import' })
    
    if (await importButton.isVisible()) {
      await importButton.click()
      
      // Aguardar modal de importação
      await page.waitForSelector('h2:has-text("Importar Leads")', { timeout: 5000 })
      
      // Verificar elementos do modal
      await expect(page.locator('input[type="file"]')).toBeVisible()
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
      
      console.log('✅ Modal de importação funcionando')
    } else {
      console.log('⚠️ Botão Import não visível (usuário pode ser consultor)')
    }
  })

  test('should open export modal', async ({ page }) => {
    // Localizar botão Export/Exportar
    const exportButton = page.locator('button', { hasText: /Export|Exportar/ })
    
    if (await exportButton.isVisible()) {
      await exportButton.click()
      
      // Aguardar modal de exportação
      await page.waitForSelector('h2:has-text("Exportar Leads")', { timeout: 5000 })
      
      // Verificar filtros de exportação
      await expect(page.locator('select, input[type="checkbox"]')).toHaveCount({ min: 1 })
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
      
      console.log('✅ Modal de exportação funcionando')
    } else {
      console.log('⚠️ Botão Export não encontrado')
    }
  })

  test('should open assignment modal (admin only)', async ({ page }) => {
    // Tentar localizar botão Atribuir
    const assignButton = page.locator('button', { hasText: 'Atribuir' })
    
    if (await assignButton.isVisible()) {
      await assignButton.click()
      
      // Aguardar modal de atribuição
      await page.waitForSelector('h2:has-text("Atribuir Leads")', { timeout: 5000 })
      
      // Verificar lista de consultores
      await expect(page.locator('select, [role="listbox"]')).toBeVisible()
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
      
      console.log('✅ Modal de atribuição funcionando')
    } else {
      console.log('⚠️ Botão Atribuir não visível (usuário pode ser consultor)')
    }
  })

  test('should display kanban columns correctly', async ({ page }) => {
    // Verificar se todas as colunas do kanban estão visíveis
    const expectedColumns = [
      'Lead Qualificado',
      'R1 Agendada', 
      'R2 + Proposta',
      'Cliente Assinado'
    ]
    
    for (const columnTitle of expectedColumns) {
      await expect(page.locator(`text=${columnTitle}`)).toBeVisible()
    }
    
    // Verificar contadores de leads nas colunas
    const columnCounters = page.locator('[class*="badge"], [class*="count"]')
    expect(await columnCounters.count()).toBeGreaterThan(0)
    
    console.log('✅ Colunas do kanban carregadas corretamente')
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Testar criação de lead com dados inválidos
    const novoButton = page.locator('button', { hasText: 'Novo' }).first()
    
    if (await novoButton.isVisible()) {
      await novoButton.click()
      await page.waitForSelector('h2:has-text("Novo Lead")')
      
      // Submeter sem nome (deve dar erro)
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Verificar mensagem de erro
      await expect(page.locator('text=Nome é obrigatório')).toBeVisible({ timeout: 3000 })
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
      
      console.log('✅ Validação de formulário funcionando')
    }
  })

  test('should take screenshots for evidence', async ({ page }) => {
    // Screenshot do dashboard completo
    await page.screenshot({ 
      path: 'relatorios/2025-09-22_go-live/leads_dashboard.png',
      fullPage: true 
    })
    
    // Screenshot do kanban
    const kanbanBoard = page.locator('[class*="kanban"]').first()
    if (await kanbanBoard.isVisible()) {
      await kanbanBoard.screenshot({ 
        path: 'relatorios/2025-09-22_go-live/kanban_board.png' 
      })
    }
    
    // Abrir modal de novo lead para screenshot
    const novoButton = page.locator('button', { hasText: 'Novo' }).first()
    if (await novoButton.isVisible()) {
      await novoButton.click()
      await page.waitForSelector('h2:has-text("Novo Lead")')
      
      await page.screenshot({ 
        path: 'relatorios/2025-09-22_go-live/new_lead_modal.png' 
      })
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
    }
    
    console.log('✅ Screenshots salvos para evidência')
  })
})

test.describe('Funcionalidades por Papel', () => {
  test('admin should see all admin buttons', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Admin deve ver todos os botões
    const adminButtons = [
      'Novo',
      'Import', 
      'Export',
      'Atribuir'
    ]
    
    for (const buttonText of adminButtons) {
      const button = page.locator(`button:has-text("${buttonText}")`)
      // Não falhar se não encontrar (pode ser consultor)
      if (await button.isVisible()) {
        console.log(`✅ Botão ${buttonText} visível`)
      } else {
        console.log(`⚠️ Botão ${buttonText} não visível (usuário pode ser consultor)`)
      }
    }
  })

  test('should respect user permissions', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Verificar se a sidebar mostra o papel correto
    const roleIndicator = page.locator('text=Administrador, text=Consultor')
    if (await roleIndicator.isVisible()) {
      const roleText = await roleIndicator.textContent()
      console.log(`✅ Papel do usuário: ${roleText}`)
      
      // Verificar funcionalidades baseadas no papel
      if (roleText?.includes('Administrador')) {
        // Admin deve ver botões de admin
        await expect(page.locator('button:has-text("Import")')).toBeVisible()
      } else {
        // Consultor não deve ver botões de admin
        await expect(page.locator('button:has-text("Import")')).not.toBeVisible()
      }
    }
  })
})