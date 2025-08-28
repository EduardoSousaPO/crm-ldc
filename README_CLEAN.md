# CRM - LDC Capital

Sistema de CRM otimizado para consultorias de investimentos, desenvolvido com Next.js 15, Supabase e inteligência artificial integrada.

## Visão Geral

O CRM LDC Capital é uma solução completa para gestão de relacionamento com clientes em consultorias de investimentos, oferecendo:

- **Sistema CRUD completo** para leads e clientes
- **Pipeline de vendas** com 7 estágios otimizados
- **Separação de acessos** por roles (Admin, SDR, Consultor)
- **Inteligência artificial** para análise de conversas e follow-ups
- **Automação de tarefas** e workflows
- **Design profissional** e responsivo

## Stack Técnica

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilo**: TailwindCSS + PostCSS
- **IA**: OpenAI (Whisper + GPT-4o-mini)
- **Deploy**: Vercel
- **Cache**: React Query (@tanstack/react-query)

## Pipeline de 7 Fases

1. **Lead Qualificado** - Leads validados e prontos para contato
2. **Contato Inicial** - Primeiro contato realizado
3. **Reunião Agendada** - R1 marcada com o prospect
4. **Discovery Concluído** - Levantamento de necessidades completo
5. **Proposta Apresentada** - Proposta comercial enviada
6. **Em Negociação** - Negociando condições e valores
7. **Cliente Ativo** - Cliente convertido e ativo

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Chave da API OpenAI (opcional)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/EduardoSousaPO/crm-ldc.git
cd crm-ldc

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Execute em desenvolvimento
npm run dev
```

### Configuração do Banco de Dados

1. Crie um projeto no Supabase
2. Execute as migrations em `supabase/migrations/`
3. Configure as políticas RLS
4. Adicione as chaves no `.env.local`

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
```

## Funcionalidades Principais

### Gestão de Leads
- **CRUD completo** com validação
- **Drag & drop** entre estágios
- **Atribuição automática** para consultores
- **Sistema de scoring** dinâmico
- **Histórico completo** de interações

### Sistema de Roles
- **Admin**: Acesso total, gestão de usuários
- **SDR**: Qualificação e atribuição de leads
- **Consultor**: Gestão de leads pessoais

### Inteligência Artificial
- **Transcrição de áudio** (OpenAI Whisper)
- **Análise de sentimento** e insights
- **Geração de follow-ups** automáticos
- **Resumos inteligentes** de conversas

### Automação
- **Workflows N8N** para processos complexos
- **Integração Google Calendar** para agendamentos
- **Tarefas automáticas** após atribuições
- **Notificações** em tempo real

## Design System

### Paleta de Cores
- **Primary**: Azul petróleo (#334155)
- **Secondary**: Cinza escuro (#1e293b)
- **Background**: Branco (#ffffff)
- **Surface**: Cinza claro (#f8fafc)
- **Border**: Cinza médio (#e2e8f0)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold)

### Componentes
- **Cards**: Sombra sutil, bordas arredondadas
- **Botões**: Estados hover e focus definidos
- **Inputs**: Validação visual integrada
- **Modais**: Overlay escuro, animações suaves

## Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `leads` - Leads e prospects
- `interactions` - Histórico de interações
- `tasks` - Tarefas e follow-ups
- `meetings` - Reuniões agendadas

### Relacionamentos
- Lead → Consultor (1:N)
- Lead → Interactions (1:N)
- Lead → Tasks (1:N)
- User → Tasks (1:N)

## Deploy no Vercel

### Configuração Automática

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
OPENAI_API_KEY=sua_chave_openai
```

## Testes

### Tipos de Teste
- **Unitários**: Jest + Testing Library
- **Integração**: Cypress
- **E2E**: Playwright

### Executar Testes
```bash
npm run test          # Testes unitários
npm run test:e2e      # Testes E2E
npm run test:coverage # Coverage report
```

## Métricas de Sucesso

### Performance
- **Bundle size**: < 200kB
- **First Load**: < 3s
- **Lighthouse**: > 90

### Conversão
- **Lead → Cliente**: Meta 15%
- **Tempo médio**: < 30 dias
- **Satisfação**: > 4.5/5

### Produtividade
- **Tempo por lead**: -50%
- **Follow-ups**: +300%
- **Conversões**: +25%

## Estrutura do Projeto

```
crm-ldc/
├── app/                 # App Router (Next.js 13+)
├── components/          # Componentes React
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── types/              # Definições TypeScript
├── docs/               # Documentação
└── relatorios/         # Relatórios de desenvolvimento
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Código
- **ESLint**: Configuração personalizada
- **Prettier**: Formatação automática
- **Husky**: Git hooks para qualidade
- **Conventional Commits**: Padrão de mensagens

---

**Desenvolvido para consultores de investimentos**

Sistema robusto, escalável e otimizado para máxima produtividade na aquisição e gestão de clientes em consultorias financeiras.
