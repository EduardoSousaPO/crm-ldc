#!/usr/bin/env node

/**
 * Script Principal de Gerenciamento de Dados - CRM LDC
 * Centraliza operações de backup, restore e limpeza
 */

const { createBackup, listBackups } = require('./backup-data')
const { restoreBackup, listAvailableBackups } = require('./restore-backup')
const { createTestUsers, listTestUsers } = require('./create-test-users')
const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function showMenu() {
  console.log('\n🛠️  GERENCIADOR DE DADOS - CRM LDC')
  console.log('=====================================')
  console.log('1. 📂 Criar backup dos dados')
  console.log('2. 📋 Listar backups disponíveis') 
  console.log('3. 🔄 Restaurar backup')
  console.log('4. 🧹 Limpar dados demo (SQL)')
  console.log('5. 👤 Criar usuários de teste')
  console.log('6. ✅ Verificar usuários de teste')
  console.log('7. 🔧 Aplicar políticas RLS')
  console.log('8. 🧪 Executar testes E2E')
  console.log('9. 📊 Status completo do sistema')
  console.log('0. ❌ Sair')
  console.log('=====================================')
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function executeOption(option) {
  try {
    switch (option) {
      case '1':
        console.log('\n📂 Criando backup...')
        await createBackup()
        break

      case '2':
        console.log('\n📋 Backups disponíveis:')
        const backups = listBackups()
        if (backups.length === 0) {
          console.log('   Nenhum backup encontrado.')
        } else {
          backups.forEach((backup, index) => {
            console.log(`   ${index + 1}. ${backup.file}`)
            console.log(`      📅 ${new Date(backup.created).toLocaleString('pt-BR')}`)
            console.log(`      💾 ${backup.size} MB`)
          })
        }
        break

      case '3':
        const availableBackups = listAvailableBackups()
        if (availableBackups.length === 0) {
          console.log('❌ Nenhum backup disponível para restaurar.')
          break
        }
        
        console.log('\n📋 Selecione o backup para restaurar:')
        availableBackups.forEach((backup, index) => {
          console.log(`   ${index + 1}. ${backup.file}`)
        })
        
        const backupIndex = await askQuestion('Digite o número do backup: ')
        const selectedBackup = availableBackups[parseInt(backupIndex) - 1]
        
        if (selectedBackup) {
          await restoreBackup(selectedBackup.file)
        } else {
          console.log('❌ Backup inválido selecionado.')
        }
        break

      case '4':
        console.log('\n⚠️  ATENÇÃO: Esta operação irá APAGAR TODOS os dados demo!')
        const confirm = await askQuestion('Digite "CONFIRMAR" para prosseguir: ')
        
        if (confirm === 'CONFIRMAR') {
          console.log('🧹 Executando limpeza via SQL...')
          console.log('⚠️  Certifique-se de que o Supabase está configurado corretamente.')
          console.log('📄 Execute manualmente o arquivo: scripts/clean-demo-data.sql')
          console.log('   no painel do Supabase > SQL Editor')
        } else {
          console.log('❌ Operação cancelada.')
        }
        break

      case '5':
        console.log('\n👤 Criando usuários de teste...')
        await createTestUsers()
        break

      case '6':
        console.log('\n✅ Verificando usuários de teste...')
        await listTestUsers()
        break

      case '7':
        console.log('\n🔧 Aplicando políticas RLS...')
        try {
          execSync('node scripts/apply-rls-policies.js', { stdio: 'inherit' })
        } catch (error) {
          console.error('❌ Erro ao aplicar RLS. Execute manualmente:', error.message)
        }
        break

      case '8':
        console.log('\n🧪 Executando testes E2E...')
        console.log('⚠️  Certifique-se de que:')
        console.log('   1. O servidor está rodando (npm run dev)')
        console.log('   2. Os usuários de teste existem')
        console.log('   3. O banco está populado')
        
        const runTests = await askQuestion('Continuar? (s/N): ')
        if (runTests.toLowerCase() === 's') {
          try {
            execSync('npm run test:e2e', { stdio: 'inherit' })
          } catch (error) {
            console.error('❌ Testes falharam. Verifique os pré-requisitos.')
          }
        }
        break

      case '9':
        console.log('\n📊 Status do Sistema:')
        console.log('===================')
        
        // Verificar backups
        const systemBackups = listBackups()
        console.log(`📂 Backups: ${systemBackups.length} disponíveis`)
        
        // Verificar usuários de teste
        console.log('👤 Usuários de teste:')
        await listTestUsers()
        
        // Verificar estrutura de arquivos
        const fs = require('fs')
        const scriptsExist = [
          'scripts/backup-data.js',
          'scripts/restore-backup.js', 
          'scripts/clean-demo-data.sql',
          'scripts/apply-rls-policies.js',
          'scripts/create-test-users.js'
        ].every(file => fs.existsSync(file))
        
        console.log(`📄 Scripts: ${scriptsExist ? '✅ Todos presentes' : '❌ Arquivos faltando'}`)
        
        // Verificar variáveis de ambiente
        const envVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        console.log(`🔧 Env vars: ${envVars ? '✅ Configuradas' : '❌ Faltando SUPABASE vars'}`)
        
        break

      case '0':
        console.log('👋 Saindo...')
        rl.close()
        process.exit(0)

      default:
        console.log('❌ Opção inválida. Tente novamente.')
    }
  } catch (error) {
    console.error(`❌ Erro ao executar opção ${option}:`, error.message)
  }
}

async function main() {
  console.log('🚀 Iniciando Gerenciador de Dados do CRM LDC...')
  
  while (true) {
    showMenu()
    const option = await askQuestion('\n🎯 Escolha uma opção: ')
    await executeOption(option.trim())
    
    if (option !== '0') {
      await askQuestion('\n⏸️  Pressione Enter para continuar...')
    }
  }
}

// CLI
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erro fatal:', error.message)
    process.exit(1)
  })
}

module.exports = { showMenu, executeOption }
