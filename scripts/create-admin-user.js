const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Carregar variáveis de ambiente (opcional)
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

async function createAdminUser() {
  console.log('🔧 Criador de Usuário Administrador - CRM LDC Capital\n')
  
  try {
    // Coletar informações do admin
    const email = await askQuestion('📧 Email do administrador: ')
    const password = await askQuestion('🔒 Senha do administrador: ')
    const name = await askQuestion('👤 Nome completo: ')
    
    if (!email || !password || !name) {
      console.error('❌ Todos os campos são obrigatórios')
      process.exit(1)
    }
    
    console.log('\n🚀 Criando usuário administrador...')
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: name
      }
    })
    
    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`)
    }
    
    console.log('✅ Usuário criado no sistema de autenticação')
    
    // Criar perfil na tabela users
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.warn('⚠️  Erro ao criar perfil:', profileError.message)
      
      // Tentar atualizar se o perfil já existir
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin', name: name })
        .eq('id', authData.user.id)
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`)
      } else {
        console.log('✅ Perfil atualizado para administrador')
      }
    } else {
      console.log('✅ Perfil de administrador criado')
    }
    
    // Verificar se o usuário foi criado corretamente
    const { data: userProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (checkError) {
      throw new Error(`Erro ao verificar usuário: ${checkError.message}`)
    }
    
    console.log('\n🎉 Usuário administrador criado com sucesso!')
    console.log('📋 Detalhes:')
    console.log(`   ID: ${userProfile.id}`)
    console.log(`   Email: ${userProfile.email}`)
    console.log(`   Nome: ${userProfile.name}`)
    console.log(`   Papel: ${userProfile.role}`)
    console.log(`   Criado em: ${new Date(userProfile.created_at).toLocaleString('pt-BR')}`)
    
    console.log('\n🔐 Credenciais de Login:')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)
    
    console.log('\n💡 Próximos passos:')
    console.log('1. Faça login no sistema com as credenciais acima')
    console.log('2. Acesse /dashboard/users para gerenciar outros usuários')
    console.log('3. Acesse /dashboard/automations para configurar automações')
    console.log('4. Configure as integrações em /dashboard/settings')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Função para promover usuário existente a admin
async function promoteToAdmin() {
  console.log('⬆️  Promover Usuário Existente para Administrador\n')
  
  try {
    const email = await askQuestion('📧 Email do usuário para promover: ')
    
    if (!email) {
      console.error('❌ Email é obrigatório')
      process.exit(1)
    }
    
    // Buscar usuário
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (findError || !user) {
      throw new Error('Usuário não encontrado')
    }
    
    if (user.role === 'admin') {
      console.log('ℹ️  Este usuário já é administrador')
      return
    }
    
    // Promover para admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
    
    if (updateError) {
      throw new Error(`Erro ao promover usuário: ${updateError.message}`)
    }
    
    console.log(`✅ Usuário ${user.name} (${user.email}) promovido para administrador!`)
    
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Menu principal
async function main() {
  console.log('🔧 Gerenciamento de Usuários Administradores\n')
  console.log('1. Criar novo usuário administrador')
  console.log('2. Promover usuário existente para administrador')
  console.log('3. Sair\n')
  
  const choice = await askQuestion('Escolha uma opção (1-3): ')
  
  switch (choice) {
    case '1':
      await createAdminUser()
      break
    case '2':
      await promoteToAdmin()
      break
    case '3':
      console.log('👋 Até logo!')
      process.exit(0)
      break
    default:
      console.log('❌ Opção inválida')
      process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = { createAdminUser, promoteToAdmin }
