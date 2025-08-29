# 🚀 Deploy CRM LDC Capital na Vercel

## **📋 CHECKLIST PRÉ-DEPLOY**

### ✅ **Configurações Essenciais**
- [x] Projeto configurado com Next.js 15
- [x] TypeScript configurado corretamente
- [x] TailwindCSS configurado
- [x] Supabase integrado
- [x] Variáveis de ambiente configuradas
- [x] Build local funcionando

### ✅ **Arquivos de Configuração**
- [x] `vercel.json` - Configuração da Vercel
- [x] `next.config.js` - Configuração do Next.js
- [x] `.env.example` - Template de variáveis
- [x] `package.json` - Scripts e dependências

## **🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS**

### **Obrigatórias (Supabase)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://nyexanwlwzdzceilxhhm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### **Recomendadas (IA)**
```bash
OPENAI_API_KEY=sk-proj-sua_chave_openai_aqui
```

### **Opcionais (Integrações)**
```bash
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
N8N_WEBHOOK_URL=sua_url_webhook_n8n
N8N_API_KEY=sua_chave_n8n
```

## **📦 PASSOS PARA DEPLOY**

### **1. Conectar Repositório**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte o repositório: `https://github.com/EduardoSousaPO/crm-ldc.git`

### **2. Configurar Variáveis**
1. Na aba "Environment Variables"
2. Adicione as variáveis obrigatórias
3. Configure para "Production", "Preview" e "Development"

### **3. Configurações de Build**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### **4. Configurações Avançadas**
- **Node.js Version**: 18.x
- **Region**: São Paulo (gru1)
- **Function Region**: gru1

## **🎯 FUNCIONALIDADES PRINCIPAIS**

### **✅ Implementadas e Testadas**
- 🔐 **Autenticação**: Login/Registro com Supabase
- 📊 **Dashboard**: Admin e Consultor separados
- 🎯 **Kanban**: Pipeline de vendas otimizado
- 🤖 **IA**: Transcrição de áudio e análise
- 📅 **Calendário**: Integração Google Calendar
- 📈 **Métricas**: KPIs e relatórios
- 📋 **Leads**: Importação/Exportação Excel
- 🎨 **Design**: Notion-inspired minimalista

### **🔧 Configurações Técnicas**
- **Next.js**: 15.1.3 (App Router)
- **React**: 19.0.0
- **TypeScript**: Configurado
- **Supabase**: Database + Auth + RLS
- **TailwindCSS**: Design system
- **Framer Motion**: Animações
- **React Query**: Cache de dados

## **🚨 TROUBLESHOOTING**

### **Erro de Build**
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### **Erro de Variáveis**
- Verificar se todas as variáveis obrigatórias estão configuradas
- Confirmar URLs do Supabase
- Testar chaves de API

### **Erro de Tipos**
```bash
# Regenerar tipos do Supabase
npm run db:generate
```

## **📱 URLS IMPORTANTES**

### **Produção**
- **URL Principal**: `https://crm-ldc-capital.vercel.app`
- **Dashboard**: `/dashboard`
- **Login**: `/auth/login`

### **Desenvolvimento**
- **Local**: `http://localhost:3000`
- **Preview**: URLs geradas automaticamente

## **🎉 PÓS-DEPLOY**

### **Testes Essenciais**
1. ✅ Login/Registro funcionando
2. ✅ Dashboard carregando
3. ✅ Kanban operacional
4. ✅ IA respondendo
5. ✅ Importação de leads
6. ✅ Responsividade mobile

### **Monitoramento**
- **Vercel Analytics**: Habilitado
- **Error Tracking**: Logs da Vercel
- **Performance**: Core Web Vitals

---

**🎯 PROJETO PRONTO PARA PRODUÇÃO!**
*CRM LDC Capital - Minimalista, IA-Powered, Notion-Inspired*
