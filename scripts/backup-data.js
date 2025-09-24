#!/usr/bin/env node

/**
 * Script de Backup de Dados - CRM LDC
 * Cria backup completo dos dados antes de limpeza ou deploy
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
  console.error('   Necessário: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Tabelas para backup (em ordem de dependência)
const TABLES = [
  'leads',
  'interactions', 
  'tasks',
  'meetings',
  'calendar_events',
  'automation_workflows',
  'automation_logs'
]

async function createBackup() {
  try {
    console.log('🔄 Iniciando backup dos dados...')
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
      console.log(`📁 Diretório criado: ${BACKUP_DIR}`)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`)
    
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        total_tables: TABLES.length
      },
      data: {}
    }

    let totalRecords = 0

    // Fazer backup de cada tabela
    for (const table of TABLES) {
      console.log(`📊 Fazendo backup da tabela: ${table}`)
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })

        if (error) {
          console.warn(`⚠️  Erro ao fazer backup de ${table}:`, error.message)
          backup.data[table] = {
            error: error.message,
            records: [],
            count: 0
          }
          continue
        }

        backup.data[table] = {
          records: data || [],
          count: count || 0,
          backed_up_at: new Date().toISOString()
        }

        totalRecords += count || 0
        console.log(`   ✅ ${count || 0} registros salvos`)

      } catch (err) {
        console.warn(`⚠️  Erro inesperado em ${table}:`, err.message)
        backup.data[table] = {
          error: err.message,
          records: [],
          count: 0
        }
      }
    }

    // Adicionar estatísticas finais
    backup.metadata.total_records = totalRecords
    backup.metadata.file_size_mb = Math.round(JSON.stringify(backup).length / 1024 / 1024 * 100) / 100

    // Salvar arquivo de backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    console.log('\n🎉 Backup concluído com sucesso!')
    console.log(`📁 Arquivo: ${backupFile}`)
    console.log(`📊 Total de registros: ${totalRecords}`)
    console.log(`💾 Tamanho do arquivo: ${backup.metadata.file_size_mb} MB`)

    // Mostrar resumo por tabela
    console.log('\n📋 Resumo por tabela:')
    for (const table of TABLES) {
      const tableData = backup.data[table]
      if (tableData.error) {
        console.log(`   ${table}: ❌ ERRO - ${tableData.error}`)
      } else {
        console.log(`   ${table}: ${tableData.count} registros`)
      }
    }

    return backupFile

  } catch (error) {
    console.error('❌ Erro durante o backup:', error)
    throw error
  }
}

// Função para listar backups existentes
function listBackups() {
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
  const command = process.argv[2]

  if (command === 'list') {
    console.log('📋 Backups disponíveis:')
    const backups = listBackups()
    if (backups.length === 0) {
      console.log('   Nenhum backup encontrado.')
    } else {
      backups.forEach((backup, index) => {
        console.log(`   ${index + 1}. ${backup.file}`)
        console.log(`      📅 Criado: ${new Date(backup.created).toLocaleString('pt-BR')}`)
        console.log(`      💾 Tamanho: ${backup.size} MB`)
        console.log('')
      })
    }
  } else {
    // Criar backup
    createBackup()
      .then(backupFile => {
        console.log(`\n🔗 Para restaurar este backup, execute:`)
        console.log(`   node scripts/restore-backup.js "${path.basename(backupFile)}"`)
      })
      .catch(error => {
        console.error('💥 Falha no backup:', error.message)
        process.exit(1)
      })
  }
}

module.exports = { createBackup, listBackups }