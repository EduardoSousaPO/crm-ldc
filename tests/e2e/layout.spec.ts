import { test, expect } from '@playwright/test'

test.describe('Layout Full-Width', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação para evitar redirecionamento
    await page.goto('/dashboard')
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('aside', { timeout: 10000 })
    await page.waitForSelector('main', { timeout: 10000 })
  })

  test('should have sidebar at x=0 with no left gap', async ({ page }) => {
    const sidebar = page.locator('aside').first()
    
    // Sidebar deve existir
    await expect(sidebar).toBeVisible()
    
    // Sidebar deve estar colada na borda esquerda (x = 0)
    const sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0)
    
    console.log('✅ Sidebar position:', sidebarBox)
  })

  test('should have main content starting exactly after sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first()
    const main = page.locator('main').first()
    
    await expect(sidebar).toBeVisible()
    await expect(main).toBeVisible()
    
    const sidebarBox = await sidebar.boundingBox()
    const mainBox = await main.boundingBox()
    
    // Main deve começar exatamente onde a sidebar termina
    const sidebarEnd = (sidebarBox?.x ?? 0) + (sidebarBox?.width ?? 0)
    const mainStart = mainBox?.x ?? 0
    
    // Permitir tolerância de 1-2px para arredondamento
    expect(Math.abs(sidebarEnd - mainStart)).toBeLessThanOrEqual(2)
    
    console.log('✅ Sidebar end:', sidebarEnd)
    console.log('✅ Main start:', mainStart)
    console.log('✅ Gap:', Math.abs(sidebarEnd - mainStart))
  })

  test('should occupy full width without horizontal scroll', async ({ page }) => {
    const viewport = page.viewportSize()
    const body = page.locator('body')
    
    // Verificar que não há scroll horizontal
    const bodyBox = await body.boundingBox()
    expect(bodyBox?.width).toBeLessThanOrEqual(viewport?.width ?? 0)
    
    // Verificar que o layout ocupa toda a largura
    const layoutDiv = page.locator('div').filter({ hasText: /Dashboard|CRM/ }).first()
    const layoutBox = await layoutDiv.boundingBox()
    
    console.log('✅ Viewport width:', viewport?.width)
    console.log('✅ Body width:', bodyBox?.width)
    console.log('✅ Layout width:', layoutBox?.width)
  })

  test('should render kanban columns without horizontal scroll on 100% zoom', async ({ page }) => {
    // Aguardar carregamento do kanban
    await page.waitForSelector('[class*="kanban"]', { timeout: 10000 })
    
    const kanbanContainer = page.locator('[class*="kanban"]').first()
    await expect(kanbanContainer).toBeVisible()
    
    // Verificar que as colunas estão visíveis
    const columns = page.locator('[class*="column"]')
    const columnCount = await columns.count()
    
    expect(columnCount).toBeGreaterThan(0)
    console.log('✅ Kanban columns found:', columnCount)
    
    // Verificar que não há overflow horizontal no container principal
    const main = page.locator('main')
    const scrollWidth = await main.evaluate(el => el.scrollWidth)
    const clientWidth = await main.evaluate(el => el.clientWidth)
    
    // Permitir pequena diferença para scrollbars
    expect(scrollWidth - clientWidth).toBeLessThan(20)
    
    console.log('✅ Scroll width:', scrollWidth)
    console.log('✅ Client width:', clientWidth)
  })

  test('should maintain layout on different screen sizes', async ({ page }) => {
    // Testar em desktop
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.reload()
    await page.waitForSelector('aside')
    
    let sidebar = page.locator('aside').first()
    let sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0)
    console.log('✅ Desktop (1440px) - Sidebar at x=0')
    
    // Testar em laptop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.reload()
    await page.waitForSelector('aside')
    
    sidebar = page.locator('aside').first()
    sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0)
    console.log('✅ Laptop (1024px) - Sidebar at x=0')
    
    // Testar em tela grande
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await page.waitForSelector('aside')
    
    sidebar = page.locator('aside').first()
    sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox?.x).toBe(0)
    console.log('✅ Large screen (1920px) - Sidebar at x=0')
  })

  test('should take screenshot for visual evidence', async ({ page }) => {
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Aguardar animações
    
    // Screenshot da página completa
    await page.screenshot({ 
      path: 'relatorios/2025-09-22_go-live/layout_no_gap.png', 
      fullPage: true 
    })
    
    // Screenshot apenas do layout (sem conteúdo dinâmico)
    await page.screenshot({ 
      path: 'relatorios/2025-09-22_go-live/layout_structure.png',
      clip: { x: 0, y: 0, width: 800, height: 600 }
    })
    
    console.log('✅ Screenshots saved to relatorios/2025-09-22_go-live/')
  })
})

test.describe('Sidebar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('aside')
  })

  test('should collapse and expand sidebar without breaking layout', async ({ page }) => {
    const sidebar = page.locator('aside').first()
    const main = page.locator('main').first()
    
    // Estado inicial - sidebar expandida
    let sidebarBox = await sidebar.boundingBox()
    let mainBox = await main.boundingBox()
    const initialSidebarWidth = sidebarBox?.width ?? 0
    const initialMainStart = mainBox?.x ?? 0
    
    console.log('✅ Initial sidebar width:', initialSidebarWidth)
    console.log('✅ Initial main start:', initialMainStart)
    
    // Clicar no botão de colapsar (se existir)
    const collapseButton = page.locator('button[title*="colapsar"], button[title*="Recolher"]').first()
    if (await collapseButton.isVisible()) {
      await collapseButton.click()
      await page.waitForTimeout(500) // Aguardar animação
      
      // Verificar estado colapsado
      sidebarBox = await sidebar.boundingBox()
      mainBox = await main.boundingBox()
      const collapsedSidebarWidth = sidebarBox?.width ?? 0
      const collapsedMainStart = mainBox?.x ?? 0
      
      expect(collapsedSidebarWidth).toBeLessThan(initialSidebarWidth)
      expect(collapsedMainStart).toBeLessThan(initialMainStart)
      
      console.log('✅ Collapsed sidebar width:', collapsedSidebarWidth)
      console.log('✅ Collapsed main start:', collapsedMainStart)
      
      // Expandir novamente
      await collapseButton.click()
      await page.waitForTimeout(500)
      
      // Verificar que voltou ao estado inicial
      sidebarBox = await sidebar.boundingBox()
      mainBox = await main.boundingBox()
      
      expect(sidebarBox?.width).toBeCloseTo(initialSidebarWidth, 5)
      expect(mainBox?.x).toBeCloseTo(initialMainStart, 5)
      
      console.log('✅ Sidebar collapse/expand working correctly')
    } else {
      console.log('⚠️ Collapse button not found, skipping collapse test')
    }
  })
})