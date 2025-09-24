const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Executando Suite Completa de Testes - CRM LDC')
console.log('=' .repeat(50))

// Verificar se as dependências de teste estão instaladas
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const devDeps = packageJson.devDependencies || {}

const requiredTestDeps = [
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event',
  '@playwright/test',
  'jest',
  'jest-environment-jsdom'
]

console.log('📦 Verificando dependências de teste...')
const missingDeps = requiredTestDeps.filter(dep => !devDeps[dep])

if (missingDeps.length > 0) {
  console.log('❌ Dependências faltando:', missingDeps.join(', '))
  console.log('💡 Para instalar: npm install --save-dev', missingDeps.join(' '))
  console.log('\n🔧 Configuração necessária:')
  console.log('1. Instalar dependências acima')
  console.log('2. Configurar jest.config.js')
  console.log('3. Instalar Playwright: npx playwright install')
  process.exit(1)
}

console.log('✅ Todas as dependências estão instaladas')

// Criar diretório de resultados se não existir
const resultsDir = path.join(__dirname, '../test-results')
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true })
}

const testResults = {
  unit: { passed: 0, failed: 0, total: 0, duration: 0 },
  e2e: { passed: 0, failed: 0, total: 0, duration: 0 },
  overall: { passed: 0, failed: 0, total: 0, duration: 0 }
}

// Função para executar comando e capturar resultado
function runCommand(command, testType) {
  console.log(`\n🏃 Executando testes ${testType}...`)
  console.log(`📝 Comando: ${command}`)
  
  const startTime = Date.now()
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minutos timeout
    })
    
    const duration = Date.now() - startTime
    console.log(`✅ Testes ${testType} concluídos em ${duration}ms`)
    
    // Parse simples do output (pode precisar ajustar conforme formato real)
    const lines = output.split('\n')
    const passedMatch = output.match(/(\d+) passed?/i)
    const failedMatch = output.match(/(\d+) failed?/i)
    const totalMatch = output.match(/(\d+) total/i)
    
    testResults[testType] = {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      duration
    }
    
    return { success: true, output }
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.log(`❌ Testes ${testType} falharam após ${duration}ms`)
    console.log('Erro:', error.message)
    
    // Tentar extrair informações mesmo com falha
    const output = error.stdout || error.message
    const failedMatch = output.match(/(\d+) failed?/i)
    const totalMatch = output.match(/(\d+) total/i)
    
    testResults[testType] = {
      passed: 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 1,
      total: totalMatch ? parseInt(totalMatch[1]) : 1,
      duration
    }
    
    return { success: false, output, error: error.message }
  }
}

// Executar testes unitários
console.log('\n📋 FASE 1: Testes Unitários')
console.log('-' .repeat(30))

const unitResult = runCommand('npm run test:unit || jest --testPathPattern=tests/unit', 'unit')

if (unitResult.success) {
  console.log('✅ Testes unitários passaram')
} else {
  console.log('⚠️  Alguns testes unitários falharam')
  console.log('Output:', unitResult.output.substring(0, 500) + '...')
}

// Executar testes E2E
console.log('\n📋 FASE 2: Testes End-to-End')
console.log('-' .repeat(30))

const e2eResult = runCommand('npm run test:e2e || npx playwright test', 'e2e')

if (e2eResult.success) {
  console.log('✅ Testes E2E passaram')
} else {
  console.log('⚠️  Alguns testes E2E falharam')
  console.log('Output:', e2eResult.output.substring(0, 500) + '...')
}

// Calcular totais
testResults.overall = {
  passed: testResults.unit.passed + testResults.e2e.passed,
  failed: testResults.unit.failed + testResults.e2e.failed,
  total: testResults.unit.total + testResults.e2e.total,
  duration: testResults.unit.duration + testResults.e2e.duration
}

// Gerar relatório
console.log('\n📊 RELATÓRIO FINAL DE TESTES')
console.log('=' .repeat(50))

console.log('\n📋 Testes Unitários:')
console.log(`   ✅ Passou: ${testResults.unit.passed}`)
console.log(`   ❌ Falhou: ${testResults.unit.failed}`)
console.log(`   📊 Total: ${testResults.unit.total}`)
console.log(`   ⏱️  Tempo: ${testResults.unit.duration}ms`)

console.log('\n🌐 Testes E2E:')
console.log(`   ✅ Passou: ${testResults.e2e.passed}`)
console.log(`   ❌ Falhou: ${testResults.e2e.failed}`)
console.log(`   📊 Total: ${testResults.e2e.total}`)
console.log(`   ⏱️  Tempo: ${testResults.e2e.duration}ms`)

console.log('\n🎯 RESUMO GERAL:')
console.log(`   ✅ Passou: ${testResults.overall.passed}`)
console.log(`   ❌ Falhou: ${testResults.overall.failed}`)
console.log(`   📊 Total: ${testResults.overall.total}`)
console.log(`   ⏱️  Tempo Total: ${testResults.overall.duration}ms`)

const successRate = testResults.overall.total > 0 
  ? ((testResults.overall.passed / testResults.overall.total) * 100).toFixed(1)
  : 0

console.log(`   📈 Taxa de Sucesso: ${successRate}%`)

// Salvar relatório em arquivo
const reportData = {
  timestamp: new Date().toISOString(),
  results: testResults,
  successRate: parseFloat(successRate),
  environment: {
    node: process.version,
    platform: process.platform
  }
}

fs.writeFileSync(
  path.join(resultsDir, 'test-report.json'),
  JSON.stringify(reportData, null, 2)
)

console.log(`\n💾 Relatório salvo em: ${path.join(resultsDir, 'test-report.json')}`)

// Screenshots e evidências
console.log('\n📸 Evidências dos Testes:')
const screenshotDirs = [
  'test-results/screenshots',
  'test-results/videos',
  'test-results/html-report'
]

screenshotDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir)
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath)
    if (files.length > 0) {
      console.log(`   📁 ${dir}: ${files.length} arquivos`)
    }
  }
})

// Determinar código de saída
if (testResults.overall.failed > 0) {
  console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.')
  process.exit(1)
} else if (testResults.overall.total === 0) {
  console.log('\n⚠️  Nenhum teste foi executado.')
  process.exit(1)
} else {
  console.log('\n🎉 Todos os testes passaram com sucesso!')
  process.exit(0)
}
