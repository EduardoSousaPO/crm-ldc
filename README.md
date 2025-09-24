# 🚀 CRM - LDC Capital

Sistema de CRM inteligente da LDC Capital otimizado para o processo de aquisição de clientes. Pipeline de 4 fases com automação completa via IA, N8N e WAHA para máxima eficiência dos consultores.

## ✨ Características

- **Processo LDC Otimizado**: 4 fases específicas para aquisição de clientes
- **Automação Completa**: IA + N8N + WAHA qualificam leads automaticamente  
- **Endpoint Auto-Import**: API para receber leads do Google Sheets
- **IA Integrada**: Transcrição, análise e sugestões automáticas
- **Interface Sem Fricção**: Drag & Drop otimizado para o fluxo LDC
- **Tempo Real**: Atualizações instantâneas e sincronização perfeita

## 🏗️ Stack Técnica

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Deploy**: Vercel
- **IA**: OpenAI (Whisper + GPT-4)
- **Automação**: N8N + Supabase Edge Functions

## 🎯 Pipeline LDC - Processo de Aquisição (4 Fases)

1. **Lead Qualificado** → Qualificação automática via IA + N8N + WAHA
2. **R1 Agendada** → Primeira reunião de diagnóstico
3. **R2 + Proposta** → Estudo apresentado + proposta + follow-up  
4. **Cliente Assinado** → Contrato fechado + onboarding automático

### 🚀 Automações Integradas
- **Entrada automática** de leads via Google Sheets
- **IA transcreve** reuniões e gera resumos
- **Follow-ups automáticos** personalizados
- **Calendário integrado** com lembretes
- **Métricas em tempo real** do funil de conversão

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Vercel (para deploy)

### Instalação

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd crm-consultoria-investimentos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nyexanwlwzdzceilxhhm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_aqui
OPENAI_API_KEY=sua_chave_openai_aqui
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
├── app/                    # App Router (Next.js 15)
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── providers.tsx      # Provedores de contexto
├── components/            # Componentes reutilizáveis
│   ├── KanbanBoard.tsx    # Board principal
│   ├── KanbanColumn.tsx   # Colunas do Kanban
│   ├── LeadCard.tsx       # Cards dos leads
│   └── ...
├── lib/                   # Utilitários e configurações
├── types/                 # Tipos TypeScript
├── relatorios/           # Relatórios de implementação
└── ...
```

## 🎨 Design System

### Paleta de Cores
- **Primary**: #000000 (Preto absoluto)
- **Secondary**: #FFFFFF (Branco puro)  
- **Accent**: #6366F1 (Indigo moderno)
- **Success**: #10B981 (Verde suave)
- **Warning**: #F59E0B (Amarelo elegante)
- **Error**: #EF4444 (Vermelho limpo)

### Princípios
- **Minimalismo extremo**: Máximo de informação com mínimo visual
- **Espaçamento generoso**: Breathing room entre elementos
- **Dark mode first**: Interface escura como padrão
- **Animações sutis**: Micro-interações que não distraem

## 🗄️ Banco de Dados

### Tabelas Principais
- **users**: Perfis de consultores
- **leads**: Leads/clientes em potencial
- **interactions**: Interações e notas
- **tasks**: Tarefas e follow-ups  
- **meetings**: Reuniões agendadas

### Segurança
- Row Level Security (RLS) habilitado
- Políticas granulares por consultor
- Triggers automáticos
- Índices otimizados

## 🚀 Deploy no Vercel

1. **Conecte seu repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Deploy automático a cada push**

O projeto está configurado para deploy automático com as configurações em `vercel.json`.

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Verificação de tipos
npm run type-check

# Linter
npm run lint
```

## 🛠️ Scripts de Gerenciamento de Dados

### Gerenciador Interativo
```bash
# Menu interativo com todas as opções
node scripts/manage-data.js
```

### Backup e Restore
```bash
# Criar backup dos dados
node scripts/backup-data.js

# Listar backups disponíveis  
node scripts/backup-data.js list

# Restaurar backup específico
node scripts/restore-backup.js backup-2025-09-22T14-30-00-000Z.json
```

### Usuários de Teste
```bash
# Criar usuários para testes E2E
node scripts/create-test-users.js

# Verificar se usuários existem e funcionam
node scripts/create-test-users.js check
```

### Limpeza de Dados Demo
```bash
# ⚠️  ATENÇÃO: Apenas para DEV/STAGING
# Execute o arquivo SQL no painel do Supabase:
# scripts/clean-demo-data.sql
```

### Políticas RLS
```bash
# Aplicar políticas de segurança no banco
node scripts/apply-rls-policies.js
```

## 🚦 Pré-requisitos para Testes E2E

Antes de executar `npm run test:e2e`, certifique-se de que:

1. **Servidor está rodando**: `npm run dev`
2. **Usuários de teste existem**: `node scripts/create-test-users.js`
3. **Banco tem dados**: Pelo menos alguns leads de exemplo
4. **Variáveis de ambiente**: Configuradas corretamente

### Credenciais de Teste
- **Admin**: admin@ldccapital.com / admin123!@#
- **Consultor**: consultor1@ldccapital.com / consultor123!

## 📈 Métricas de Sucesso

### KPIs Técnicos
- **Performance**: Lighthouse score > 90
- **Uptime**: 99.9%
- **Response time**: < 200ms

### KPIs de Negócio  
- **Produtividade**: 70% redução tempo administrativo
- **Conversão**: 25% aumento taxa de conversão
- **Adoção**: 90% dos consultores usando ativamente

## 🔒 Segurança

- **Autenticação**: Supabase Auth com MFA
- **Autorização**: Row Level Security
- **Criptografia**: TLS 1.3 + dados em repouso
- **Compliance**: LGPD + CVM

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, envie um email para [suporte@crm-investimentos.com](mailto:suporte@crm-investimentos.com) ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para consultores de investimentos**
