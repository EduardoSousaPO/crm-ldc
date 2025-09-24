const { createBackup } = require('./backup-data')
const { cleanDemoDataSilent } = require('./clean-demo-data')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function backupAndClean() {
  console.log('💾🧹 BACKUP E LIMPEZA - CRM LDC CAPITAL')
  console.log('=' .repeat(60))
  console.log('Este script irá:')
  console.log('1. 💾 Fazer backup completo dos dados atuais')
  console.log('2. 🧹 Limpar todos os dados simulados')
  console.log('3. 🎉 Deixar o sistema pronto para produção')
  console.log('=' .repeat(60))
  
  try {
    // Confirmar operação
    const confirm = await askQuestion('\nContinuar com backup e limpeza? (s/N): ')
    
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
      console.log('❌ Operação cancelada')
      rl.close()
      return
    }
    
    console.log('\n🚀 Iniciando processo...')
    
    // 1. Fazer backup
    console.log('\n📍 ETAPA 1/2: CRIANDO BACKUP')
    console.log('-' .repeat(30))
    
    const backupFile = await createBackup()
    
    console.log(`✅ Backup salvo em: ${backupFile}`)
    
    // 2. Limpar dados
    console.log('\n📍 ETAPA 2/2: LIMPANDO DADOS')
    console.log('-' .repeat(30))
    
    await cleanDemoDataSilent()
    
    // 3. Relatório final
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 PROCESSO CONCLUÍDO COM SUCESSO!')
    console.log('=' .repeat(60))
    console.log('✅ Backup dos dados criado')
    console.log('✅ Dados simulados removidos')
    console.log('✅ Sistema limpo e pronto para produção')
    console.log('✅ Lead de exemplo criado para demonstração')
    
    console.log('\n💾 BACKUP CRIADO:')
    console.log(`   📁 ${backupFile}`)
    console.log('   💡 Para restaurar: npm run restore:backup')
    
    console.log('\n🚀 SISTEMA PRONTO!')
    console.log('   🌐 Acesse: http://localhost:3001/dashboard')
    console.log('   👤 Faça login e comece a usar')
    
  } catch (error) {
    console.error('\n❌ Erro durante o processo:', error.message)
    console.log('\n💡 Tente executar os comandos separadamente:')
    console.log('   npm run backup:data')
    console.log('   npm run clean:demo')
  } finally {
    rl.close()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  backupAndClean().catch(error => {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  })
}

module.exports = { backupAndClean }



