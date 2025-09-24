# 📋 Relatório Completo da Estrutura do CRM LDC

**Data:** 22/09/2025  
**Objetivo:** Mapear todos os arquivos e pastas para identificar problema do menu persistente

---

## 🏗️ Estrutura de Diretórios

### **📁 `/app` - Aplicação Next.js 15 (App Router)**

#### **📁 `/app/api` - Rotas da API**
- **`/auth/google/route.ts`** - Autenticação OAuth com Google
- **`/calendar/auth/route.ts`** - Autenticação para integração de calendário
- **`/calendar/events/route.ts`** - CRUD de eventos de calendário
- **`/generate-followup/route.ts`** - Geração de follow-ups automatizados
- **`/leads/route.ts`** - API principal de leads (GET, POST)
- **`/leads/[id]/route.ts`** - API de lead específico (GET, PUT, DELETE)
- **`/leads/auto-import/route.ts`** - Importação automática de leads
- **`/leads/export/route.ts`** - Exportação de leads (CSV/Excel)
- **`/leads/import/route.ts`** - Importação manual de leads
- **`/test-automation/`** - Testes de automação da API
- **`/test-supabase/`** - Testes de conexão Supabase
- **`/transcribe/route.ts`** - Transcrição de áudio/vídeo

#### **📁 `/app/auth` - Páginas de Autenticação**
- **`login/page.tsx`** - Página de login
- **`register/page.tsx`** - Página de cadastro

#### **📁 `/app/dashboard` - Dashboard Principal**
- **`layout.tsx`** - ⚠️ **LAYOUT PRINCIPAL DO DASHBOARD** (possível fonte do problema)
- **`page.tsx`** - Página principal do dashboard (redireciona admin/consultor)
- **`automations/page.tsx`** - Página de automações (placeholder)
- **`calendar/page.tsx`** - Página de calendário (placeholder)
- **`kuvera/page.tsx`** - Dashboard estilo Kuvera
- **`kuvera-kanban/page.tsx`** - Kanban estilo Kuvera
- **`manual/page.tsx`** - Manual interativo
- **`reports/page.tsx`** - Página de relatórios (placeholder)
- **`settings/page.tsx`** - Configurações (placeholder)
- **`users/page.tsx`** - Gestão de usuários (placeholder)

#### **📁 `/app` - Arquivos Raiz**
- **`layout.tsx`** - Layout raiz da aplicação
- **`page.tsx`** - Página inicial (redireciona para dashboard)
- **`providers.tsx`** - Providers globais (React Query, Toast, Sidebar)
- **`globals.css`** - Estilos globais CSS

---

## 🧩 Componentes React

### **📁 `/components` - Componentes React**

#### **🏠 Dashboards**
- **`AdminDashboard.tsx`** - Dashboard para administradores
- **`ConsultorDashboard.tsx`** - Dashboard para consultores
- **`KuveraInspiredDashboard.tsx`** - Dashboard inspirado no Kuvera

#### **📊 Componentes Kanban (8 variações)**
- **`KanbanBoard.tsx`** - Kanban básico
- **`KanbanColumn.tsx`** - Coluna do Kanban
- **`NotionKanbanBoard.tsx`** - ⚠️ **USADO NO ADMIN** - Kanban estilo Notion
- **`UltraResponsiveKanbanBoard.tsx`** - ⚠️ **USADO NO CONSULTOR** - Kanban responsivo
- **`OptimizedKanbanBoard.tsx`** - Kanban otimizado
- **`HighPerformanceKanbanBoard.tsx`** - Kanban alta performance
- **`NativeDragKanbanBoard.tsx`** - Kanban com drag nativo
- **`KuveraKanbanBoard.tsx`** - Kanban estilo Kuvera

#### **📇 Componentes de Lead**
- **`LeadCard.tsx`** - Card básico de lead
- **`ModernLeadCard.tsx`** - Card moderno de lead
- **`SimpleLeadCard.tsx`** - Card simples de lead
- **`VirtualizedLeadCard.tsx`** - Card virtualizado
- **`NativeDragLeadCard.tsx`** - Card com drag nativo

#### **🪟 Modais**
- **`NewLeadModal.tsx`** - Modal para novo lead
- **`LeadDetailModal.tsx`** - ⚠️ **DEPRECATED** - Modal de detalhes
- **`OptimizedLeadModal.tsx`** - Modal otimizado (substitui o anterior)
- **`LeadImportModal.tsx`** - Modal de importação
- **`LeadExportModal.tsx`** - Modal de exportação
- **`LeadAssignmentModal.tsx`** - Modal de atribuição
- **`LeadQualificationModal.tsx`** - Modal de qualificação
- **`QuickAddLeadModal.tsx`** - Modal rápido de adição

#### **🧭 Navegação e Layout**
- **`Sidebar.tsx`** - ⚠️ **SIDEBAR PRINCIPAL** (possível fonte do problema)
- **`DashboardHeader.tsx`** - ⚠️ **HEADER REMOVIDO** (pode ainda estar sendo usado)
- **`PlaceholderPage.tsx`** - Páginas placeholder

#### **🔧 Utilitários**
- **`LoadingSpinner.tsx`** - Componente de loading
- **`LDCLogo.tsx`** - Logo da LDC
- **`DragFeedback.tsx`** - Feedback visual de drag
- **`AIAssistant.tsx`** - Assistente de IA
- **`AudioRecorder.tsx`** - Gravador de áudio
- **`CalendarIntegration.tsx`** - Integração de calendário
- **`ManualInterativo.tsx`** - Manual interativo

---

## 🎣 Hooks Customizados

### **📁 `/hooks`**
- **`useAdminDashboard.ts`** - Hook para dados do admin
- **`useConsultorDashboard.ts`** - Hook para dados do consultor
- **`useLeadAPI.ts`** - Hook para API de leads
- **`useOptimizedDragDrop.ts`** - Hook para drag & drop

---

## 🌐 Contextos React

### **📁 `/contexts`**
- **`SidebarContext.tsx`** - Contexto da sidebar (isCollapsed, toggleSidebar)

---

## 📚 Bibliotecas e Utilitários

### **📁 `/lib`**
- **`supabase.ts`** - Cliente Supabase (browser, server, service)
- **`queryClient.ts`** - Configuração React Query
- **`utils.ts`** - Utilitários gerais
- **`calendar.ts`** - Utilitários de calendário
- **`leadScoring.ts`** - Sistema de pontuação de leads
- **`n8n.ts`** - Integração com n8n

### **📁 `/utils`**
- **`leadTemplate.ts`** - Templates de leads
- **`performanceMonitor.ts`** - Monitor de performance

---

## 🎨 Estilos CSS

### **📁 `/styles`**
- **`notion-inspired.css`** - ⚠️ **ESTILOS NOTION** (pode conter CSS problemático)
- **`kuvera-inspired.css`** - Estilos inspirados no Kuvera
- **`globals.css`** - Estilos globais Tailwind

---

## 🗄️ Banco de Dados

### **📁 `/supabase`**
- **`migrations/001_enable_rls_policies.sql`** - Políticas RLS

### **📁 `/types`**
- **`supabase.ts`** - Tipos TypeScript gerados do Supabase

---

## 🧪 Testes

### **📁 `/tests`**
- **`e2e/auth.spec.ts`** - Testes E2E de autenticação
- **`e2e/dashboard.spec.ts`** - Testes E2E do dashboard
- **`e2e/layout.spec.ts`** - Testes E2E de layout
- **`e2e/leads.spec.ts`** - Testes E2E de leads
- **`unit/components.test.tsx`** - Testes unitários de componentes
- **`unit/hooks.test.ts`** - Testes unitários de hooks

---

## 🔧 Configurações

### **Arquivos de Configuração:**
- **`next.config.js`** - Configuração Next.js
- **`tailwind.config.js`** - Configuração Tailwind CSS
- **`tsconfig.json`** - Configuração TypeScript
- **`playwright.config.ts`** - Configuração Playwright
- **`jest.config.js`** - Configuração Jest
- **`jest.setup.js`** - Setup Jest
- **`postcss.config.js`** - Configuração PostCSS
- **`package.json`** - Dependências e scripts
- **`vercel.json`** - Configuração Vercel

---

## 📝 Scripts

### **📁 `/scripts`**
- **`apply-rls-policies.js`** - Aplicar políticas RLS
- **`backup-and-clean.js`** - Backup e limpeza
- **`backup-data.js`** - Backup de dados
- **`clean-demo-data.js`** - Limpar dados demo
- **`create-admin-user.js`** - Criar usuário admin
- **`restore-backup.js`** - Restaurar backup
- **`run-tests.js`** - Executar testes

---

## 📊 Relatórios e Documentação

### **📁 `/docs`**
- **`configuracao-api.md`** - Configuração da API
- **`etapas.md`** - Etapas do projeto
- **`fluxograma-ldc.md`** - Fluxograma LDC
- **`ideação.md`** - Processo de ideação
- **`pesquisa.md`** - Pesquisa do projeto
- **`roadmap.md`** - Roadmap do projeto

### **📁 `/relatorios`**
- **`2024-01-26_fase1_*`** - Relatórios Fase 1
- **`2024-01-26_fase2_*`** - Relatórios Fase 2
- **`2024-01-26_fase3_*`** - Relatórios Fase 3
- **`2025-09-22_auditoria/`** - Auditoria atual
- **`2025-09-22_layout/`** - Correções de layout

### **Arquivos de Relatório Raiz:**
- **`RELATORIO_AUDITORIA_CRM_LDC.md`** - Auditoria geral
- **`RELATORIO_CORRECOES_IMPLEMENTADAS.md`** - Correções implementadas
- **`DESIGN_NOTION_STYLE_IMPLEMENTADO.md`** - Design Notion
- **`DRAG_DROP_ULTRA_PERFORMATICO.md`** - Drag & Drop
- **`plano-execucao-crm.md`** - Plano de execução

---

## 🔍 POSSÍVEIS FONTES DO PROBLEMA

### **⚠️ Arquivos Suspeitos que Podem Estar Renderizando Menu:**

1. **`app/dashboard/layout.tsx`** - Layout principal do dashboard
2. **`components/Sidebar.tsx`** - Componente da sidebar
3. **`components/DashboardHeader.tsx`** - Header que deveria estar removido
4. **`styles/notion-inspired.css`** - CSS que pode estar aplicando estilos
5. **`components/NotionKanbanBoard.tsx`** - Kanban usado no admin
6. **`components/UltraResponsiveKanbanBoard.tsx`** - Kanban usado no consultor

### **🎯 Próxima Investigação:**
1. Verificar se `DashboardHeader` ainda está sendo importado em algum lugar
2. Analisar CSS do `notion-inspired.css` 
3. Verificar se há headers residuais nos componentes Kanban
4. Investigar se o `layout.tsx` do dashboard está correto

---

**Relatório gerado em:** 22/09/2025  
**Total de arquivos principais:** ~150+  
**Componentes React:** 45+  
**Próximo passo:** Investigação direcionada dos arquivos suspeitos
