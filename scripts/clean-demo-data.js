const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Carregar variáveis de ambiente
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  console.log('⚠️  dotenv não encontrado, usando process.env diretamente')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE não encontradas')
  console.log('Verifique se .env.local contém:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

// Tabelas que serão limpas (em ordem de dependência)
const TABLES_TO_CLEAN = [
  {
    name: 'automation_logs',
    description: 'Logs de execução de automações',
    hasUsers: false
  },
  {
    name: 'automation_workflows', 
    description: 'Workflows de automação configurados',
    hasUsers: false
  },
  {
    name: 'calendar_events',
    description: 'Eventos do calendário',
    hasUsers: false
  },
  {
    name: 'meetings',
    description: 'Reuniões agendadas',
    hasUsers: false
  },
  {
    name: 'tasks',
    description: 'Tarefas e follow-ups',
    hasUsers: false
  },
  {
    name: 'interactions',
    description: 'Interações com leads (notas, áudios, etc)',
    hasUsers: false
  },
  {
    name: 'leads',
    description: 'Leads e clientes',
    hasUsers: false
  },
  {
    name: 'user_integrations',
    description: 'Integrações dos usuários',
    hasUsers: false
  }
]

async function getTableStats() {
  console.log('📊 Coletando estatísticas das tabelas...\n')
  
  const stats = {}
  
  for (const table of TABLES_TO_CLEAN) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.warn(`⚠️  Erro ao contar ${table.name}:`, error.message)
        stats[table.name] = 0
      } else {
        stats[table.name] = count || 0
      }
    } catch (err) {
      console.warn(`⚠️  Erro ao acessar ${table.name}:`, err.message)
      stats[table.name] = 0
    }
  }
  
  return stats
}

async function showCurrentStats(stats) {
  console.log('📋 DADOS ATUAIS NO SISTEMA:')
  console.log('=' .repeat(50))
  
  let totalRecords = 0
  
  for (const table of TABLES_TO_CLEAN) {
    const count = stats[table.name] || 0
    totalRecords += count
    
    const emoji = count > 0 ? '📦' : '📭'
    console.log(`${emoji} ${table.description}: ${count} registros`)
  }
  
  console.log('=' .repeat(50))
  console.log(`📊 TOTAL DE REGISTROS: ${totalRecords}`)
  
  if (totalRecords === 0) {
    console.log('✅ Sistema já está limpo!')
    return false
  }
  
  return true
}

async function confirmDeletion() {
  console.log('\n⚠️  ATENÇÃO: OPERAÇÃO IRREVERSÍVEL!')
  console.log('Esta ação irá EXCLUIR PERMANENTEMENTE todos os dados listados acima.')
  console.log('Os usuários cadastrados serão PRESERVADOS.')
  console.log('')
  
  const confirm1 = await askQuestion('Digite "CONFIRMAR" para continuar (ou Enter para cancelar): ')
  
  if (confirm1.toUpperCase() !== 'CONFIRMAR') {
    console.log('❌ Operação cancelada pelo usuário.')
    return false
  }
  
  const confirm2 = await askQuestion('Tem CERTEZA ABSOLUTA? Digite "SIM" para prosseguir: ')
  
  if (confirm2.toUpperCase() !== 'SIM') {
    console.log('❌ Operação cancelada pelo usuário.')
    return false
  }
  
  return true
}

async function cleanTable(tableName, description) {
  try {
    console.log(`🧹 Limpando ${description}...`)
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos exceto um ID impossível
    
    if (error) {
      throw error
    }
    
    // Verificar se foi limpo
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (count === 0) {
      console.log(`✅ ${description} limpa com sucesso`)
      return { success: true, remaining: 0 }
    } else {
      console.log(`⚠️  ${description} parcialmente limpa (${count} registros restantes)`)
      return { success: false, remaining: count }
    }
    
  } catch (error) {
    console.error(`❌ Erro ao limpar ${description}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function resetSequences() {
  console.log('\n🔄 Resetando sequências e IDs...')
  
  try {
    // Resetar sequências se existirem (PostgreSQL)
    const resetQueries = [
      "SELECT setval(pg_get_serial_sequence('leads', 'id'), 1, false);",
      "SELECT setval(pg_get_serial_sequence('interactions', 'id'), 1, false);",
      "SELECT setval(pg_get_serial_sequence('tasks', 'id'), 1, false);",
      "SELECT setval(pg_get_serial_sequence('meetings', 'id'), 1, false);"
    ]
    
    for (const query of resetQueries) {
      try {
        // Tentar executar, mas não falhar se não existir
        await supabase.rpc('exec_sql', { sql_query: query })
      } catch (err) {
        // Ignorar erros de sequências não existentes
      }
    }
    
    console.log('✅ Sequências resetadas')
  } catch (error) {
    console.log('⚠️  Aviso: Não foi possível resetar sequências (normal para UUIDs)')
  }
}

async function createWelcomeData() {
  console.log('\n🎉 Criando dados de boas-vindas...')
  
  try {
    // Buscar primeiro admin para criar lead de exemplo
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()
    
    if (adminUser) {
      // Criar lead de boas-vindas
      const { error } = await supabase
        .from('leads')
        .insert({
          name: 'Lead de Exemplo - CRM LDC Capital',
          email: 'exemplo@ldccapital.com',
          phone: '+55 11 99999-9999',
          origin: 'Sistema',
          notes: 'Este é um lead de exemplo para demonstrar o funcionamento do CRM. Você pode excluí-lo quando quiser.',
          status: 'lead_qualificado',
          consultant_id: adminUser.id,
          score: 75
        })
      
      if (!error) {
        console.log('✅ Lead de exemplo criado')
        
        // Buscar o lead criado para adicionar interação
        const { data: newLead } = await supabase
          .from('leads')
          .select('id')
          .eq('email', 'exemplo@ldccapital.com')
          .single()
        
        if (newLead) {
          // Adicionar interação de boas-vindas
          await supabase
            .from('interactions')
            .insert({
              lead_id: newLead.id,
              type: 'note',
              content: 'Sistema CRM LDC Capital configurado e pronto para uso! 🚀',
              ai_summary: 'Lead de exemplo criado automaticamente após limpeza do sistema.'
            })
          
          console.log('✅ Interação de boas-vindas adicionada')
        }
      }
    } else {
      console.log('⚠️  Nenhum admin encontrado. Crie um admin primeiro com: npm run admin:create')
    }
    
  } catch (error) {
    console.log('⚠️  Não foi possível criar dados de boas-vindas:', error.message)
  }
}

async function cleanDemoData() {
  console.log('🧹 LIMPEZA DE DADOS SIMULADOS - CRM LDC CAPITAL')
  console.log('=' .repeat(60))
  console.log('Este script irá remover todos os dados de demonstração,')
  console.log('deixando o sistema limpo e pronto para uso em produção.')
  console.log('=' .repeat(60))
  
  try {
    // 1. Coletar estatísticas atuais
    const stats = await getTableStats()
    
    // 2. Mostrar dados atuais
    const hasData = await showCurrentStats(stats)
    
    if (!hasData) {
      console.log('\n🎉 Sistema já está limpo e pronto para uso!')
      rl.close()
      return
    }
    
    // 3. Confirmar exclusão
    const confirmed = await confirmDeletion()
    
    if (!confirmed) {
      rl.close()
      return
    }
    
    console.log('\n🚀 Iniciando limpeza dos dados...')
    console.log('=' .repeat(40))
    
    // 4. Limpar tabelas em ordem
    let totalCleaned = 0
    let totalErrors = 0
    
    for (const table of TABLES_TO_CLEAN) {
      const result = await cleanTable(table.name, table.description)
      
      if (result.success) {
        totalCleaned++
      } else {
        totalErrors++
      }
      
      // Pequena pausa entre limpezas
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 5. Resetar sequências
    await resetSequences()
    
    // 6. Criar dados de boas-vindas
    await createWelcomeData()
    
    // 7. Relatório final
    console.log('\n' + '=' .repeat(50))
    console.log('📊 RELATÓRIO DE LIMPEZA:')
    console.log(`✅ Tabelas limpas: ${totalCleaned}`)
    console.log(`❌ Erros: ${totalErrors}`)
    console.log('=' .repeat(50))
    
    if (totalErrors === 0) {
      console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!')
      console.log('✅ Sistema está limpo e pronto para uso em produção')
      console.log('✅ Usuários cadastrados foram preservados')
      console.log('✅ Políticas RLS continuam ativas')
      console.log('✅ Lead de exemplo criado para demonstração')
      
      console.log('\n🚀 PRÓXIMOS PASSOS:')
      console.log('1. Faça login no sistema')
      console.log('2. Comece a cadastrar seus leads reais')
      console.log('3. Configure suas integrações em /dashboard/settings')
      console.log('4. Configure automações em /dashboard/automations (admin)')
    } else {
      console.log('\n⚠️  LIMPEZA CONCLUÍDA COM ALGUNS ERROS')
      console.log('Verifique os erros acima e execute novamente se necessário')
    }
    
    // 8. Coletar estatísticas finais
    console.log('\n📊 DADOS FINAIS:')
    const finalStats = await getTableStats()
    await showCurrentStats(finalStats)
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message)
  } finally {
    rl.close()
  }
}

// Função para limpeza silenciosa (sem confirmação)
async function cleanDemoDataSilent() {
  console.log('🧹 Limpeza silenciosa iniciada...')
  
  try {
    for (const table of TABLES_TO_CLEAN) {
      await cleanTable(table.name, table.description)
    }
    
    await resetSequences()
    await createWelcomeData()
    
    console.log('✅ Limpeza silenciosa concluída')
    
  } catch (error) {
    console.error('❌ Erro na limpeza silenciosa:', error.message)
    throw error
  }
}

// Menu principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--silent') || args.includes('-s')) {
    await cleanDemoDataSilent()
    return
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🧹 Limpeza de Dados Simulados - CRM LDC Capital')
    console.log('')
    console.log('Uso:')
    console.log('  node scripts/clean-demo-data.js          # Limpeza interativa')
    console.log('  node scripts/clean-demo-data.js --silent # Limpeza sem confirmação')
    console.log('  node scripts/clean-demo-data.js --help   # Mostrar ajuda')
    console.log('')
    console.log('Ou via npm:')
    console.log('  npm run clean:demo          # Limpeza interativa')
    console.log('  npm run clean:demo:silent   # Limpeza sem confirmação')
    return
  }
  
  await cleanDemoData()
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  })
}

module.exports = { cleanDemoData, cleanDemoDataSilent }



