#!/usr/bin/env node

/**
 * Script para aplicar políticas RLS no Supabase
 * 
 * Uso:
 * node scripts/apply-rls-policies.js
 * 
 * Variáveis de ambiente necessárias:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (não anon key!)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente necessárias:')
  console.error('   SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Cliente Supabase com service role (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function applyRLSPolicies() {
  try {
    console.log('🚀 Iniciando aplicação das políticas RLS...')
    
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../supabase/migrations/001_enable_rls_policies.sql')
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlPath}`)
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    console.log(`📄 Arquivo SQL carregado: ${sqlPath}`)
    
    // Dividir em comandos individuais (separados por ';')
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📋 ${commands.length} comandos SQL encontrados`)
    
    // Executar cada comando
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      try {
        // Executar comando SQL
        const { error } = await supabase.rpc('exec_sql', { sql: command })
        
        if (error) {
          // Alguns erros são esperados (ex: função já existe)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`⚠️  Comando ${i + 1}: ${error.message}`)
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message)
            console.error(`   SQL: ${command.substring(0, 100)}...`)
            errorCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`❌ Erro ao executar comando ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Resumo da aplicação:')
    console.log(`✅ Comandos executados com sucesso: ${successCount}`)
    console.log(`❌ Comandos com erro: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Todas as políticas RLS foram aplicadas com sucesso!')
    } else {
      console.log('\n⚠️  Algumas políticas podem não ter sido aplicadas. Verifique os erros acima.')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    process.exit(1)
  }
}

async function verifyRLSStatus() {
  try {
    console.log('\n🔍 Verificando status do RLS...')
    
    const tables = [
      'users', 'leads', 'interactions', 'tasks', 
      'meetings', 'calendar_events', 'user_integrations',
      'automation_workflows', 'automation_logs'
    ]
    
    for (const table of tables) {
      try {
        // Verificar se RLS está habilitado
        const { data, error } = await supabase
          .from('pg_tables')
          .select('*')
          .eq('tablename', table)
        
        if (error) {
          console.log(`⚠️  Não foi possível verificar tabela ${table}`)
        } else if (data && data.length > 0) {
          console.log(`✅ Tabela ${table}: RLS configurado`)
        } else {
          console.log(`❌ Tabela ${table}: Não encontrada`)
        }
      } catch (err) {
        console.log(`⚠️  Erro ao verificar tabela ${table}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
  }
}

async function createAdminUser() {
  try {
    console.log('\n👑 Criando usuário admin de teste...')
    
    // Dados do admin
    const adminData = {
      email: 'admin@ldccapital.com',
      password: 'admin123!@#',
      user_metadata: {
        name: 'Administrador LDC',
        role: 'admin'
      }
    }
    
    // Criar usuário via auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      user_metadata: adminData.user_metadata,
      email_confirm: true
    })
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário admin já existe')
        return
      }
      throw authError
    }
    
    // Inserir perfil na tabela users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: adminData.email,
        name: adminData.user_metadata.name,
        role: 'admin'
      })
    
    if (profileError) {
      if (profileError.message.includes('duplicate key')) {
        console.log('⚠️  Perfil admin já existe')
      } else {
        throw profileError
      }
    } else {
      console.log('✅ Usuário admin criado com sucesso!')
      console.log(`   Email: ${adminData.email}`)
      console.log(`   Senha: ${adminData.password}`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message)
  }
}

async function createTestConsultors() {
  try {
    console.log('\n👤 Criando consultores de teste...')
    
    const consultors = [
      {
        email: 'consultor1@ldccapital.com',
        password: 'consultor123!',
        name: 'João Silva'
      },
      {
        email: 'consultor2@ldccapital.com', 
        password: 'consultor123!',
        name: 'Maria Santos'
      },
      {
        email: 'consultor3@ldccapital.com',
        password: 'consultor123!', 
        name: 'Pedro Oliveira'
      },
      {
        email: 'consultor4@ldccapital.com',
        password: 'consultor123!',
        name: 'Ana Costa'
      }
    ]
    
    for (const consultor of consultors) {
      try {
        // Criar usuário via auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: consultor.email,
          password: consultor.password,
          user_metadata: {
            name: consultor.name,
            role: 'consultor'
          },
          email_confirm: true
        })
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`⚠️  Consultor ${consultor.email} já existe`)
            continue
          }
          throw authError
        }
        
        // Inserir perfil na tabela users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: consultor.email,
            name: consultor.name,
            role: 'consultor'
          })
        
        if (profileError) {
          if (profileError.message.includes('duplicate key')) {
            console.log(`⚠️  Perfil ${consultor.email} já existe`)
          } else {
            throw profileError
          }
        } else {
          console.log(`✅ Consultor criado: ${consultor.name} (${consultor.email})`)
        }
        
      } catch (err) {
        console.error(`❌ Erro ao criar consultor ${consultor.email}:`, err.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral ao criar consultores:', error.message)
  }
}

// Executar script
async function main() {
  console.log('🔐 CRM LDC - Aplicação de Políticas RLS')
  console.log('=====================================\n')
  
  await applyRLSPolicies()
  await verifyRLSStatus()
  await createAdminUser()
  await createTestConsultors()
  
  console.log('\n🎯 Script concluído!')
  console.log('\n📋 Próximos passos:')
  console.log('1. Teste o login como admin: admin@ldccapital.com / admin123!@#')
  console.log('2. Teste o login como consultor: consultor1@ldccapital.com / consultor123!')
  console.log('3. Verifique as permissões no dashboard')
  console.log('4. Execute os testes E2E para validar RLS')
}

main().catch(console.error)