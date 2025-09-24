#!/usr/bin/env node

/**
 * Script para Criar Usuários de Teste - CRM LDC
 * Cria usuários admin e consultor para testes E2E
 */

const { createClient } = require('@supabase/supabase-js')

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Usuários de teste
const TEST_USERS = [
  {
    email: 'admin@ldccapital.com',
    password: 'admin123!@#',
    role: 'admin',
    name: 'Administrador Teste',
    department: 'Administração'
  },
  {
    email: 'consultor1@ldccapital.com', 
    password: 'consultor123!',
    role: 'consultor',
    name: 'Consultor Teste 1',
    department: 'Consultoria'
  },
  {
    email: 'consultor2@ldccapital.com',
    password: 'consultor123!',
    role: 'consultor', 
    name: 'Consultor Teste 2',
    department: 'Consultoria'
  },
  {
    email: 'consultor3@ldccapital.com',
    password: 'consultor123!',
    role: 'consultor',
    name: 'Consultor Teste 3', 
    department: 'Consultoria'
  }
]

async function createTestUsers() {
  try {
    console.log('🔄 Criando usuários de teste...')
    
    for (const user of TEST_USERS) {
      console.log(`\n👤 Criando usuário: ${user.email}`)
      
      try {
        // Tentar fazer signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
              role: user.role,
              department: user.department
            }
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`   ⚠️  Usuário ${user.email} já existe`)
            
            // Tentar fazer login para verificar se funciona
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: user.password
            })
            
            if (loginError) {
              console.log(`   ❌ Login falhou: ${loginError.message}`)
            } else {
              console.log(`   ✅ Login funcionando`)
              await supabase.auth.signOut()
            }
          } else {
            console.error(`   ❌ Erro ao criar: ${authError.message}`)
          }
          continue
        }

        console.log(`   ✅ Usuário criado com sucesso`)
        console.log(`   🆔 ID: ${authData.user?.id}`)
        
        // Fazer logout para limpar sessão
        await supabase.auth.signOut()

      } catch (err) {
        console.error(`   ❌ Erro inesperado: ${err.message}`)
      }
    }

    console.log('\n🎉 Processo concluído!')
    console.log('\n📋 Credenciais criadas:')
    TEST_USERS.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${user.password}`)
    })

    console.log('\n🔗 Próximos passos:')
    console.log('   1. Verificar se os usuários podem fazer login na aplicação')
    console.log('   2. Executar testes E2E: npm run test:e2e')
    console.log('   3. Verificar permissões (admin vs consultor)')

  } catch (error) {
    console.error('❌ Erro durante criação dos usuários:', error)
    throw error
  }
}

// Função para verificar usuários existentes
async function listTestUsers() {
  try {
    console.log('📋 Verificando usuários de teste...')
    
    for (const user of TEST_USERS) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        })
        
        if (error) {
          console.log(`❌ ${user.email}: ${error.message}`)
        } else {
          console.log(`✅ ${user.email}: Login OK`)
          await supabase.auth.signOut()
        }
      } catch (err) {
        console.log(`❌ ${user.email}: Erro inesperado`)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
  }
}

// CLI
if (require.main === module) {
  const command = process.argv[2]

  if (command === 'check' || command === 'list') {
    listTestUsers()
  } else {
    createTestUsers()
      .catch(error => {
        console.error('💥 Falha na criação dos usuários:', error.message)
        process.exit(1)
      })
  }
}

module.exports = { createTestUsers, listTestUsers }
