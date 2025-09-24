import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('deve mostrar formulário de login', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Aguardar toast de erro
    await expect(page.locator('.Toastify__toast--error, [data-testid="toast-error"]')).toBeVisible({ timeout: 10000 })
  })

  test('deve navegar para registro', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.click('text=Criar conta')
    await expect(page).toHaveURL('/auth/register')
    await expect(page.locator('h1')).toContainText('Registro')
  })

  test('deve mostrar formulário de registro', async ({ page }) => {
    await page.goto('/auth/register')
    
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('deve validar campos obrigatórios no registro', async ({ page }) => {
    await page.goto('/auth/register')
    
    await page.click('button[type="submit"]')
    
    // Verificar mensagens de validação
    const nameInput = page.locator('input[name="name"]')
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(nameInput).toHaveAttribute('required')
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })
})
