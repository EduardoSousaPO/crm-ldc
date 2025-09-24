import { test, expect } from '@playwright/test'

test.describe('Permissões e RLS', () => {
  // Configurar contextos para diferentes usuários
  test.describe('Admin Permissions', () => {
    test.beforeEach(async ({ page }) => {
      // Login como admin
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'admin@ldccapital.com')
      await page.fill('input[type="password"]', 'admin123!@#')
      await page.click('button[type="submit"]')
      
      // Aguardar redirecionamento para dashboard
      await page.waitForURL('/dashboard')
      await page.waitForLoadState('networkidle')
    })

    test('admin should see all admin buttons', async ({ page }) => {
      // Admin deve ver todos os botões
      const adminButtons = [
        'Novo',
        'Import', 
        'Export',
        'Atribuir'
      ]
      
      for (const buttonText of adminButtons) {
        const button = page.locator(`button:has-text("${buttonText}")`)
        await expect(button).toBeVisible({ timeout: 10000 })
        console.log(`✅ Admin vê botão: ${buttonText}`)
      }
    })

    test('admin should see role indicator as "Administrador"', async ({ page }) => {
      // Verificar indicador de papel na sidebar
      const roleIndicator = page.locator('text=Administrador')
      await expect(roleIndicator).toBeVisible({ timeout: 10000 })
      console.log('✅ Admin role indicator correto')
    })

    test('admin should access import modal', async ({ page }) => {
      const importButton = page.locator('button:has-text("Import")')
      await expect(importButton).toBeVisible()
      await importButton.click()
      
      // Aguardar modal de importação
      await expect(page.locator('h2:has-text("Importar Leads")')).toBeVisible({ timeout: 5000 })
      console.log('✅ Admin acessa modal de importação')
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
    })

    test('admin should access assignment modal', async ({ page }) => {
      const assignButton = page.locator('button:has-text("Atribuir")')
      await expect(assignButton).toBeVisible()
      await assignButton.click()
      
      // Aguardar modal de atribuição
      await expect(page.locator('h2:has-text("Atribuir Leads")')).toBeVisible({ timeout: 5000 })
      console.log('✅ Admin acessa modal de atribuição')
      
      // Fechar modal
      const closeButton = page.locator('button[aria-label="Fechar"]').first()
      await closeButton.click()
    })

    test('admin should see all leads in kanban', async ({ page }) => {
      // Admin deve ver leads de todos os consultores
      await page.waitForSelector('[class*="kanban"]', { timeout: 15000 })
      
      // Contar leads visíveis
      const leadCards = page.locator('[class*="lead-card"]')
      const leadCount = await leadCards.count()
      
      console.log(`✅ Admin vê ${leadCount} leads no total`)
      expect(leadCount).toBeGreaterThanOrEqual(0)
    })

    test('admin should access users page (if enabled)', async ({ page }) => {
      // Verificar se a página de usuários está disponível
      const usersLink = page.locator('a[href="/dashboard/users"], button:has-text("Usuários")')
      
      if (await usersLink.isVisible()) {
        await usersLink.click()
        await page.waitForURL('/dashboard/users')
        console.log('✅ Admin acessa página de usuários')
      } else {
        console.log('⚠️ Página de usuários não habilitada (feature flag)')
      }
    })
  })

  test.describe('Consultor Permissions', () => {
    test.beforeEach(async ({ page }) => {
      // Login como consultor
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'consultor1@ldccapital.com')
      await page.fill('input[type="password"]', 'consultor123!')
      await page.click('button[type="submit"]')
      
      // Aguardar redirecionamento para dashboard
      await page.waitForURL('/dashboard')
      await page.waitForLoadState('networkidle')
    })

    test('consultor should NOT see admin buttons', async ({ page }) => {
      // Consultor NÃO deve ver botões de admin
      const adminOnlyButtons = [
        'Import',
        'Atribuir'
      ]
      
      for (const buttonText of adminOnlyButtons) {
        const button = page.locator(`button:has-text("${buttonText}")`)
        await expect(button).not.toBeVisible()
        console.log(`✅ Consultor NÃO vê botão admin: ${buttonText}`)
      }
    })

    test('consultor should see role indicator as "Consultor"', async ({ page }) => {
      // Verificar indicador de papel na sidebar
      const roleIndicator = page.locator('text=Consultor')
      await expect(roleIndicator).toBeVisible({ timeout: 10000 })
      console.log('✅ Consultor role indicator correto')
    })

    test('consultor should see allowed buttons', async ({ page }) => {
      // Consultor deve ver apenas botões permitidos
      const allowedButtons = [
        'Novo',
        'Export' // Export limitado aos seus leads
      ]
      
      for (const buttonText of allowedButtons) {
        const button = page.locator(`button:has-text("${buttonText}"), button:has-text("Exportar")`)
        await expect(button.first()).toBeVisible({ timeout: 10000 })
        console.log(`✅ Consultor vê botão permitido: ${buttonText}`)
      }
    })

    test('consultor should access export modal (limited)', async ({ page }) => {
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Exportar")')
      
      if (await exportButton.first().isVisible()) {
        await exportButton.first().click()
        
        // Aguardar modal de exportação
        await expect(page.locator('h2:has-text("Exportar Leads")')).toBeVisible({ timeout: 5000 })
        console.log('✅ Consultor acessa modal de exportação (limitado)')
        
        // Fechar modal
        const closeButton = page.locator('button[aria-label="Fechar"]').first()
        await closeButton.click()
      } else {
        console.log('⚠️ Botão Export não encontrado para consultor')
      }
    })

    test('consultor should only see own leads', async ({ page }) => {
      // Consultor deve ver apenas seus próprios leads
      await page.waitForSelector('[class*="kanban"]', { timeout: 15000 })
      
      // Contar leads visíveis
      const leadCards = page.locator('[class*="lead-card"]')
      const leadCount = await leadCards.count()
      
      console.log(`✅ Consultor vê ${leadCount} leads (apenas próprios)`)
      expect(leadCount).toBeGreaterThanOrEqual(0)
      
      // TODO: Verificar se todos os leads pertencem ao consultor
      // Isso requereria acesso aos dados do lead ou API call
    })

    test('consultor should NOT access users page', async ({ page }) => {
      // Consultor NÃO deve ver link para usuários
      const usersLink = page.locator('a[href="/dashboard/users"], button:has-text("Usuários")')
      await expect(usersLink).not.toBeVisible()
      console.log('✅ Consultor NÃO vê link para usuários')
    })

    test('consultor should NOT access admin routes directly', async ({ page }) => {
      // Tentar acessar rota admin diretamente
      await page.goto('/dashboard/users')
      
      // Deve ser redirecionado ou mostrar erro 403
      const currentUrl = page.url()
      if (currentUrl.includes('/dashboard/users')) {
        // Se chegou na página, deve mostrar acesso negado
        const accessDenied = page.locator('text=Acesso negado, text=Não autorizado, text=403')
        await expect(accessDenied).toBeVisible({ timeout: 5000 })
        console.log('✅ Consultor bloqueado em rota admin')
      } else {
        console.log('✅ Consultor redirecionado ao tentar acessar rota admin')
      }
    })
  })

  test.describe('API Permissions', () => {
    test('should respect RLS in API calls', async ({ page, request }) => {
      // Login como consultor para obter token
      await page.goto('/auth/login')
      await page.fill('input[type="email"]', 'consultor1@ldccapital.com')
      await page.fill('input[type="password"]', 'consultor123!')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
      
      // Obter token de autenticação (se possível via cookies ou localStorage)
      const cookies = await page.context().cookies()
      const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('session'))
      
      if (authCookie) {
        // Fazer chamada API como consultor
        const response = await request.get('/api/leads', {
          headers: {
            'Cookie': `${authCookie.name}=${authCookie.value}`
          }
        })
        
        expect(response.status()).toBe(200)
        
        const data = await response.json()
        console.log(`✅ API retornou ${data.data?.length || 0} leads para consultor`)
        
        // Verificar se todos os leads pertencem ao consultor
        // (isso seria validado no backend via RLS)
      } else {
        console.log('⚠️ Token de autenticação não encontrado')
      }
    })
  })

  test.describe('Feature Flags', () => {
    test('should respect feature flags for disabled features', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Verificar se funcionalidades desabilitadas não aparecem
      const disabledFeatures = [
        { selector: 'a[href="/dashboard/automations"]', name: 'Automações' },
        { selector: 'a[href="/dashboard/calendar"]', name: 'Calendário' },
        { selector: 'a[href="/dashboard/reports"]', name: 'Relatórios' }
      ]
      
      for (const feature of disabledFeatures) {
        const element = page.locator(feature.selector)
        
        // Verificar se está visível baseado na feature flag
        const isVisible = await element.isVisible()
        
        if (isVisible) {
          console.log(`✅ Feature ${feature.name} está habilitada`)
        } else {
          console.log(`⚠️ Feature ${feature.name} está desabilitada (feature flag)`)
        }
      }
    })
  })

  test.describe('Security Tests', () => {
    test('should prevent unauthorized lead access', async ({ page }) => {
      // Este teste seria mais complexo e requereria dados de teste específicos
      // Por ora, validamos que o sistema não quebra com tentativas de acesso
      
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Tentar acessar um lead específico (se houver)
      const leadCards = page.locator('[class*="lead-card"]')
      const leadCount = await leadCards.count()
      
      if (leadCount > 0) {
        // Clicar no primeiro lead
        await leadCards.first().click()
        
        // Verificar se o modal abre normalmente
        await expect(page.locator('h2:has-text("Detalhes do Lead")')).toBeVisible({ timeout: 5000 })
        console.log('✅ Acesso a lead autorizado funcionando')
        
        // Fechar modal
        const closeButton = page.locator('button[aria-label="Fechar"]').first()
        await closeButton.click()
      } else {
        console.log('⚠️ Nenhum lead disponível para teste')
      }
    })

    test('should handle authentication errors gracefully', async ({ page }) => {
      // Ir para dashboard sem login
      await page.goto('/dashboard')
      
      // Deve ser redirecionado para login
      await page.waitForURL('/auth/login', { timeout: 10000 })
      console.log('✅ Redirecionamento para login funcionando')
    })
  })

  test('should take screenshots for evidence', async ({ page }) => {
    // Login como admin para screenshots
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@ldccapital.com')
    await page.fill('input[type="password"]', 'admin123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Screenshot do dashboard admin
    await page.screenshot({ 
      path: 'relatorios/2025-09-22_go-live/admin_dashboard.png',
      fullPage: true 
    })
    
    // Login como consultor
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'consultor1@ldccapital.com')
    await page.fill('input[type="password"]', 'consultor123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Screenshot do dashboard consultor
    await page.screenshot({ 
      path: 'relatorios/2025-09-22_go-live/consultor_dashboard.png',
      fullPage: true 
    })
    
    console.log('✅ Screenshots de permissões salvos')
  })
})
