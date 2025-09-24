# 🔍 Mapeamento de Componentes e Funcionalidades - CRM LDC

**Data:** 22/09/2025  
**Status da Auditoria:** Em Progresso  

## 📋 Resumo Executivo

### ✅ Componentes Funcionais
- Layout base e navegação
- Autenticação (Login/Registro)
- Dashboard com roles (Admin/Consultor)
- Sistema de Leads com Kanban
- Modais principais (Novo Lead, Import, Export, Atribuir)
- APIs básicas funcionando

### ⚠️ Problemas Identificados
- Layout não está full-width (limitado por max-w-7xl)
- Sidebar não está fixa à esquerda
- Alguns botões sem handlers definidos
- Componentes duplicados/obsoletos
- Feature flags não implementadas
- Testes automatizados ausentes

---

## 🗺️ Mapa de Rotas e Componentes

### **1. Rotas Principais**

| Rota | Componente | Status | Observações |
|------|------------|--------|-------------|
| `/` | `app/page.tsx` | ✅ OK | Redirect para dashboard ou login |
| `/auth/login` | `app/auth/login/page.tsx` | ✅ OK | Autenticação funcionando |
| `/auth/register` | `app/auth/register/page.tsx` | ✅ OK | Registro funcionando |
| `/dashboard` | `app/dashboard/page.tsx` | ✅ OK | Dashboard principal com roles |
| `/dashboard/manual` | `app/dashboard/manual/page.tsx` | ❓ VERIFICAR | Link no header |
| `/dashboard/automations` | `app/dashboard/automations/page.tsx` | 🔄 PENDENTE | Página existe mas não implementada |
| `/dashboard/kuvera` | `app/dashboard/kuvera/page.tsx` | 🔄 PENDENTE | Página alternativa |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | 🔄 PENDENTE | Página existe mas não implementada |
| `/dashboard/users` | `app/dashboard/users/page.tsx` | 🔄 PENDENTE | Página existe mas não implementada |

### **2. APIs Implementadas**

| Endpoint | Método | Status | Funcionalidade |
|----------|--------|--------|----------------|
| `/api/leads` | GET | ✅ OK | Listar leads com filtros |
| `/api/leads` | POST | ✅ OK | Criar novo lead |
| `/api/leads/[id]` | PUT | ✅ OK | Atualizar lead |
| `/api/leads/[id]` | DELETE | ✅ OK | Excluir lead |
| `/api/leads/import` | POST | ✅ OK | Importar leads via CSV/Excel |
| `/api/leads/export` | POST | ✅ OK | Exportar leads |
| `/api/leads/auto-import` | POST | 🔄 PENDENTE | Auto-importação |
| `/api/transcribe` | POST | ✅ OK | Transcrição de áudio |
| `/api/generate-followup` | POST | ✅ OK | Geração de follow-up |
| `/api/calendar/*` | * | 🔄 PENDENTE | Integração com calendário |

### **3. Componentes do Dashboard**

#### **3.1 Layout Principal**
| Componente | Localização | Status | Handler/Ação | Endpoint | Observações |
|------------|-------------|--------|--------------|----------|-------------|
| `DashboardHeader` | `components/DashboardHeader.tsx` | ✅ OK | Menu usuário, logout | Auth | Header funcionando |
| `AdminDashboard` | `components/AdminDashboard.tsx` | ✅ OK | Render Kanban + modais | - | Componente principal admin |
| `ConsultorDashboard` | `components/ConsultorDashboard.tsx` | ✅ OK | Render Kanban + stats | - | Componente principal consultor |

#### **3.2 Sistema Kanban**
| Componente | Status | Botões/Handlers | Endpoint | Problemas |
|------------|--------|-----------------|----------|-----------|
| `NotionKanbanBoard` | ✅ OK | Drag&Drop, Novo Lead | `/api/leads` | - |
| `UltraResponsiveKanbanBoard` | ✅ OK | Drag&Drop, Novo Lead | `/api/leads` | - |
| `KanbanBoard` | ✅ OK | Drag&Drop, Novo Lead | `/api/leads` | Componente base |
| `KanbanColumn` | ✅ OK | Drop zone | - | - |
| `LeadCard` | ✅ OK | Click para detalhe | Modal | - |

#### **3.3 Modais Principais**

| Modal | Componente | Status | Handlers | Endpoint | Problemas |
|-------|------------|--------|----------|----------|-----------|
| **Novo Lead** | `NewLeadModal.tsx` | ✅ OK | onSubmit → create | `POST /api/leads` | - |
| **Detalhe Lead** | `LeadDetailModal.tsx` | ⚠️ DEPRECATED | Edit, Delete, Tabs | `PUT/DELETE /api/leads` | Substituído por OptimizedLeadModal |
| **Import Leads** | `LeadImportModal.tsx` | ✅ OK | Upload, Map, Import | `POST /api/leads/import` | - |
| **Export Leads** | `LeadExportModal.tsx` | ✅ OK | Filter, Export | `POST /api/leads/export` | - |
| **Atribuir Leads** | `LeadAssignmentModal.tsx` | ✅ OK | Select, Assign | `PUT /api/leads` | Apenas admin/sdr |

#### **3.4 Botões de Ação Principal**

| Botão | Localização | Handler | Endpoint | Status | Role Required |
|-------|-------------|---------|----------|--------|---------------|
| **+ Novo Lead** | Kanban boards | setIsNewLeadModalOpen | Modal → API | ✅ OK | Todos |
| **Import** | AdminDashboard | setIsImportModalOpen | Modal → API | ✅ OK | Admin |
| **Export** | Admin/ConsultorDashboard | setIsExportModalOpen | Modal → API | ✅ OK | Todos |
| **Atribuir Leads** | AdminDashboard | setIsAssignmentModalOpen | Modal → API | ✅ OK | Admin/SDR |
| **Buscar** | DashboardHeader | ❌ SEM HANDLER | - | ❌ QUEBRADO | Todos |
| **Notificações** | DashboardHeader | ❌ SEM HANDLER | - | ❌ QUEBRADO | Todos |
| **Manual** | DashboardHeader | router.push('/dashboard/manual') | Rota | ✅ OK | Todos |
| **Meu Perfil** | DashboardHeader | ❌ TODO | - | ❌ QUEBRADO | Todos |
| **Configurações** | DashboardHeader | ❌ TODO | - | ❌ QUEBRADO | Todos |

### **4. Hooks e Estado**

| Hook | Localização | Funcionalidade | Status |
|------|-------------|----------------|--------|
| `useAdminDashboard` | `hooks/useAdminDashboard.ts` | Fetch leads, consultors, stats | ✅ OK |
| `useConsultorDashboard` | `hooks/useConsultorDashboard.ts` | Fetch leads do consultor, stats | ✅ OK |
| `useLeadAPI` | `hooks/useLeadAPI.ts` | CRUD operations | ✅ OK |
| `useOptimizedDragDrop` | `hooks/useOptimizedDragDrop.ts` | Drag&Drop otimizado | ✅ OK |

---

## 🚨 Problemas Críticos Identificados

### **1. Layout e UI**
- ❌ **Layout não full-width**: `max-w-7xl mx-auto` limitando largura
- ❌ **Sidebar não implementada**: Header horizontal, não sidebar fixa
- ❌ **Responsividade limitada**: Não aproveita telas grandes

### **2. Botões sem Funcionalidade**
- ❌ **Busca no header**: Input sem handler
- ❌ **Notificações**: Botão sem ação
- ❌ **Meu Perfil**: Link sem página
- ❌ **Configurações**: Link sem página

### **3. Componentes Duplicados**
- ⚠️ Múltiplos componentes Kanban (NotionKanbanBoard, UltraResponsiveKanbanBoard, etc.)
- ⚠️ LeadDetailModal marcado como DEPRECATED
- ⚠️ Vários componentes de card (LeadCard, ModernLeadCard, SimpleLeadCard, etc.)

### **4. Feature Flags**
- ❌ **Não implementadas**: Páginas não prontas ainda visíveis
- ❌ **Env vars ausentes**: NEXT_PUBLIC_FEATURE_* não configuradas

### **5. Testes**
- ❌ **Testes unitários**: Ausentes
- ❌ **Testes E2E**: Ausentes
- ❌ **Playwright**: Não configurado

---

## 📋 Próximas Ações

### **Prioridade ALTA**
1. ✅ Corrigir layout full-width
2. ✅ Implementar sidebar fixa
3. ✅ Adicionar feature flags
4. ✅ Remover botões sem handler

### **Prioridade MÉDIA**
1. ✅ Limpar componentes duplicados
2. ✅ Implementar páginas placeholder
3. ✅ Adicionar validações RLS
4. ✅ Criar testes automatizados

### **Prioridade BAIXA**
1. ✅ Otimizar queries
2. ✅ Melhorar acessibilidade
3. ✅ Documentação completa

---

**Status:** 🔄 **EM PROGRESSO**  
**Próximo Passo:** Correção do layout e implementação de feature flags
