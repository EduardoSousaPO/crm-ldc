# 🚀 CRM - LDC Capital

Sistema de CRM inteligente da LDC Capital para gestão completa de clientes e investimentos. Kanban otimizado com IA integrada para máxima produtividade dos consultores.

## ✨ Características

- **Design inspirado em x.ai**: Interface limpa, escura e futurista
- **Kanban de 7 fases**: Pipeline otimizado para consultoria de investimentos
- **IA integrada**: Transcrição automática, geração de tarefas e follow-ups
- **Drag & Drop**: Movimentação intuitiva de leads entre fases
- **Tempo real**: Atualizações instantâneas via Supabase
- **Mobile-first**: Responsivo e otimizado para todos os dispositivos

## 🏗️ Stack Técnica

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Deploy**: Vercel
- **IA**: OpenAI (Whisper + GPT-4)
- **Automação**: N8N + Supabase Edge Functions

## 📊 Pipeline de 7 Fases

1. **Lead Qualificado** → Entrada automática via integração
2. **Contato Inicial** → IA valida dados + script de abertura  
3. **Reunião Agendada** → Integração calendário + lembretes automáticos
4. **Discovery Concluído** → Transcrição IA + extração de objetivos
5. **Proposta Apresentada** → Resumo comparativo + agenda follow-up
6. **Em Negociação** → Lembretes automáticos + mensagens sugeridas
7. **Cliente Ativo** → Checklist onboarding + documentos

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
