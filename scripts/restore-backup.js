#!/usr/bin/env node

/**
 * Script de Restore de Backup - CRM LDC
 * Restaura dados a partir de um arquivo de backup
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BACKUP_DIR = path.join(__dirname, '..', 'backups')

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Ordem de restauração (dependências primeiro)
const RESTORE_ORDER = [
  'leads',
  'interactions',
  'tasks', 
  'meetings',
  'calendar_events',
  'automation_workflows',
  'automation_logs'
]

async function restoreBackup(backupFileName) {
  try {
    const backupFile = path.join(BACKUP_DIR, backupFileName)
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFile}`)
    }

    console.log('📂 Carregando backup...')
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    
    console.log('📋 Informações do backup:')
    console.log(`   📅 Data: ${new Date(backupData.metadata.timestamp).toLocaleString('pt-BR')}`)
    console.log(`   🏷️  Versão: ${backupData.metadata.version}`)
    console.log(`   🌍 Ambiente: ${backupData.metadata.environment}`)
    console.log(`   📊 Total de registros: ${backupData.metadata.total_records}`)
    console.log(`   💾 Tamanho: ${backupData.metadata.file_size_mb} MB`)

    // Confirmar operação
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const confirm = await new Promise((resolve) => {
      readline.question('\n⚠️  Esta operação irá SUBSTITUIR todos os dados atuais. Continuar? (s/N): ', (answer) => {
        readline.close()
        resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim')
      })
    })

    if (!confirm) {
      console.log('❌ Operação cancelada pelo usuário.')
      return
    }

    console.log('\n🔄 Iniciando restauração...')

    let totalRestored = 0

    // Restaurar cada tabela na ordem correta
    for (const table of RESTORE_ORDER) {
      if (!backupData.data[table]) {
        console.log(`⚠️  Tabela ${table} não encontrada no backup. Pulando...`)
        continue
      }

      const tableData = backupData.data[table]
      
      if (tableData.error) {
        console.log(`❌ Tabela ${table} teve erro no backup: ${tableData.error}`)
        continue
      }

      console.log(`📊 Restaurando tabela: ${table} (${tableData.count} registros)`)

      try {
        // Limpar tabela atual
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos exceto um ID impossível

        if (deleteError) {
          console.warn(`   ⚠️  Aviso ao limpar ${table}:`, deleteError.message)
        }

        // Inserir dados em lotes para melhor performance
        const batchSize = 100
        const records = tableData.records
        
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize)
          
          const { error: insertError } = await supabase
            .from(table)
            .insert(batch)

          if (insertError) {
            console.error(`   ❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1} em ${table}:`, insertError.message)
            // Tentar inserir registros individualmente para identificar o problema
            for (const record of batch) {
              const { error: singleError } = await supabase
                .from(table)
                .insert(record)
              
              if (singleError) {
                console.error(`     ❌ Erro no registro:`, record.id || 'sem ID', singleError.message)
              }
            }
          } else {
            console.log(`   ✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(records.length/batchSize)} inserido`)
          }
        }

        totalRestored += records.length
        console.log(`   ✅ ${records.length} registros restaurados`)

      } catch (err) {
        console.error(`❌ Erro inesperado ao restaurar ${table}:`, err.message)
      }
    }

    console.log('\n🎉 Restauração concluída!')
    console.log(`📊 Total de registros restaurados: ${totalRestored}`)

    // Verificar integridade
    console.log('\n🔍 Verificando integridade...')
    for (const table of RESTORE_ORDER) {
      if (backupData.data[table] && !backupData.data[table].error) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`   ${table}: ❌ Erro na verificação`)
        } else {
          const expected = backupData.data[table].count
          const actual = count
          if (actual === expected) {
            console.log(`   ${table}: ✅ ${actual}/${expected} registros`)
          } else {
            console.log(`   ${table}: ⚠️  ${actual}/${expected} registros (divergência)`)
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a restauração:', error.message)
    throw error
  }
}

// Função para listar backups disponíveis
function listAvailableBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('📁 Nenhum backup encontrado. Diretório não existe.')
    return []
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = fs.statSync(filePath)
      return {
        file,
        path: filePath,
        size: Math.round(stats.size / 1024 / 1024 * 100) / 100,
        created: stats.birthtime.toISOString()
      }
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created))

  return files
}

// CLI
if (require.main === module) {
  const backupFileName = process.argv[2]

  if (!backupFileName) {
    console.log('📋 Uso: node restore-backup.js <nome-do-arquivo>')
    console.log('\n📁 Backups disponíveis:')
    
    const backups = listAvailableBackups()
    if (backups.length === 0) {
      console.log('   Nenhum backup encontrado.')
      console.log('   Execute: node backup-data.js')
    } else {
      backups.forEach((backup, index) => {
        console.log(`   ${index + 1}. ${backup.file}`)
        console.log(`      📅 ${new Date(backup.created).toLocaleString('pt-BR')}`)
        console.log(`      💾 ${backup.size} MB`)
        console.log('')
      })
    }
    process.exit(1)
  }

  restoreBackup(backupFileName)
    .then(() => {
      console.log('\n🔗 Próximos passos:')
      console.log('   1. Verificar se a aplicação está funcionando')
      console.log('   2. Testar login e funcionalidades principais')
      console.log('   3. Executar testes: npm run test:e2e')
    })
    .catch(error => {
      console.error('💥 Falha na restauração:', error.message)
      process.exit(1)
    })
}

module.exports = { restoreBackup, listAvailableBackups }