# 🎯 MAPA DE BOTÕES E FUNCIONALIDADES - CRM LDC

**Data:** 22/09/2025  
**Status:** ✅ INVENTÁRIO COMPLETO

---

## 📊 DASHBOARD ADMIN (AdminDashboard)

### **🎨 NotionKanbanBoard - Toolbar**
| Botão | Label | Seletor | Handler | API/Operação | Status | Arquivo:Linha |
|-------|-------|---------|---------|--------------|--------|---------------|
| ➕ | "Novo" | `.notion-btn-primary` | `onCreateLead()` | `POST /api/leads` | ✅ OK | `NotionKanbanBoard.tsx:247-253` |
| 📤 | "Import" | `.notion-btn-secondary` | `onImport()` | `LeadImportModal` | ✅ OK | `NotionKanbanBoard.tsx:255-263` |
| 📥 | "Export" | `.notion-btn-secondary` | `onExport()` | `LeadExportModal` | ✅ OK | `NotionKanbanBoard.tsx:265-273` |
| 👥 | "Atribuir" | `.notion-btn-secondary` | `onAssignLeads()` | `LeadAssignmentModal` | ✅ OK | `NotionKanbanBoard.tsx:275-283` |

### **🔄 Drag & Drop**
| Ação | Handler | API/Operação | Status | Arquivo:Linha |
|------|---------|--------------|--------|---------------|
| Arrastar Lead | `handleDragStart` | Estado local | ✅ OK | `NotionKanbanBoard.tsx:126-129` |
| Soltar Lead | `handleDragEnd` | `PUT /api/leads/[id]` (status) | ✅ OK | `NotionKanbanBoard.tsx:131-148` |

### **📋 Modais Admin**
| Modal | Trigger | Handler | API/Operação | Status | Arquivo |
|-------|---------|---------|--------------|--------|---------|
| `LeadAssignmentModal` | Botão "Atribuir" | `setIsAssignmentModalOpen(true)` | `PUT /api/leads/[id]` | ✅ OK | `AdminDashboard.tsx:111-116` |
| `LeadImportModal` | Botão "Import" | `setIsImportModalOpen(true)` | `POST /api/leads/import` | ✅ OK | `AdminDashboard.tsx:118-125` |
| `LeadExportModal` | Botão "Export" | `setIsExportModalOpen(true)` | `GET /api/leads/export` | ✅ OK | `AdminDashboard.tsx:127-133` |

---

## 👤 DASHBOARD CONSULTOR (ConsultorDashboard)

### **🎨 Toolbar Minimalista**
| Botão | Label | Seletor | Handler | API/Operação | Status | Arquivo:Linha |
|-------|-------|---------|---------|--------------|--------|---------------|
| 📥 | "Exportar" | `.btn-secondary` | `setIsExportModalOpen(true)` | `LeadExportModal` | ✅ OK | `ConsultorDashboard.tsx:98-105` |

### **🎯 UltraResponsiveKanbanBoard**
| Ação | Handler | API/Operação | Status | Arquivo |
|-------|---------|--------------|--------|---------|
| Criar Lead | `onLeadCreate` | `POST /api/leads` | ✅ OK | `ConsultorDashboard.tsx:52-78` |
| Atualizar Lead | `onUpdateLead` | `PUT /api/leads/[id]` | ✅ OK | `ConsultorDashboard.tsx:28-53` |

---

## 🃏 CARDS DE LEAD (LeadCard)

### **📱 Ações do Card**
| Botão | Label | Seletor | Handler | API/Operação | Status | Arquivo:Linha |
|-------|-------|---------|---------|--------------|--------|---------------|
| 👁️ | "Ver detalhes" | Card click | `setIsDetailModalOpen(true)` | `OptimizedLeadModal` | ✅ OK | `LeadCard.tsx:30-31` |
| ⋮ | Menu | `.menu-button` | `setIsMenuOpen(!isMenuOpen)` | Menu dropdown | ✅ OK | `LeadCard.tsx:30` |

### **📋 Modal de Detalhes**
| Modal | Trigger | Handler | Funcionalidades | Status | Arquivo |
|-------|---------|---------|----------------|--------|---------|
| `OptimizedLeadModal` | Click no card | `isDetailModalOpen` | Ver/Editar/Excluir lead | ✅ OK | `LeadCard.tsx:17` |

---

## 🏗️ OUTROS COMPONENTES KANBAN

### **📋 KanbanBoard (Genérico)**
| Botão | Label | Handler | API/Operação | Status | Arquivo:Linha |
|-------|-------|---------|--------------|--------|---------------|
| ➕ | "Novo Lead" | `setIsNewLeadModalOpen(true)` | `NewLeadModal` | ✅ OK | `KanbanBoard.tsx:118-125` |

### **🎨 OptimizedKanbanBoard**
| Modal | Trigger | Handler | Status | Arquivo:Linha |
|-------|---------|---------|--------|---------------|
| `NewLeadModal` | Botão "+" | `isNewLeadModalOpen` | ✅ OK | `OptimizedKanbanBoard.tsx:313-337` |

### **💼 KuveraKanbanBoard**
| Botão | Label | Handler | Status | Arquivo:Linha |
|-------|-------|---------|--------|---------------|
| ➕ | "Adicionar Lead" | `console.log('Criar lead')` | ⚠️ PLACEHOLDER | `KuveraKanbanBoard.tsx:228-237` |

---

## 📋 MODAIS PRINCIPAIS

### **✅ MODAIS FUNCIONAIS**

#### **🆕 NewLeadModal**
- **Arquivo:** `components/NewLeadModal.tsx`
- **Trigger:** Botões "Novo" / "Novo Lead"
- **Campos:** Nome, Email, Telefone, Origem, Perfil
- **API:** `POST /api/leads`
- **Status:** ✅ FUNCIONAL

#### **📤 LeadImportModal**
- **Arquivo:** `components/LeadImportModal.tsx`
- **Trigger:** Botão "Import" (Admin)
- **Funcionalidades:** Upload CSV/XLSX, Preview, Validação
- **API:** `POST /api/leads/import`
- **Status:** ✅ FUNCIONAL

#### **📥 LeadExportModal**
- **Arquivo:** `components/LeadExportModal.tsx`
- **Trigger:** Botão "Export"
- **Funcionalidades:** Filtros, Download CSV/XLSX
- **API:** `GET /api/leads/export`
- **Status:** ✅ FUNCIONAL

#### **👥 LeadAssignmentModal**
- **Arquivo:** `components/LeadAssignmentModal.tsx`
- **Trigger:** Botão "Atribuir" (Admin)
- **Funcionalidades:** Atribuir leads a consultores
- **API:** `PUT /api/leads/[id]` (consultant_id)
- **Status:** ✅ FUNCIONAL

#### **🔍 OptimizedLeadModal**
- **Arquivo:** `components/OptimizedLeadModal.tsx`
- **Trigger:** Click no card de lead
- **Funcionalidades:** Ver/Editar/Excluir lead
- **API:** `PUT /api/leads/[id]`, `DELETE /api/leads/[id]`
- **Status:** ✅ FUNCIONAL

#### **📊 LeadQualificationModal**
- **Arquivo:** `components/LeadQualificationModal.tsx`
- **Trigger:** Processo de qualificação
- **Funcionalidades:** Scoring e qualificação
- **Status:** ✅ FUNCIONAL

---

## 🧭 NAVEGAÇÃO (Sidebar)

### **📱 Itens do Menu**
| Item | Label | Handler | Rota | Status | Feature Flag | Arquivo:Linha |
|------|-------|---------|------|--------|-------------|---------------|
| 📊 | "Dashboard" | `handleNavigation('/dashboard')` | `/dashboard` | ✅ OK | - | `Sidebar.tsx:201` |
| 📋 | "Manual" | `handleNavigation('/dashboard/manual')` | `/dashboard/manual` | ✅ OK | - | `Sidebar.tsx:201` |
| 👥 | "Usuários" | `handleNavigation('/dashboard/users')` | `/dashboard/users` | ⚠️ PLACEHOLDER | `FEATURE_USERS` | `Sidebar.tsx:201` |
| ⚡ | "Automações" | `handleNavigation('/dashboard/automations')` | `/dashboard/automations` | ⚠️ PLACEHOLDER | `FEATURE_AUTOMATIONS` | `Sidebar.tsx:201` |
| 📅 | "Agenda" | `handleNavigation('/dashboard/calendar')` | `/dashboard/calendar` | ⚠️ PLACEHOLDER | `FEATURE_CALENDAR` | `Sidebar.tsx:201` |
| 📈 | "Relatórios" | `handleNavigation('/dashboard/reports')` | `/dashboard/reports` | ⚠️ PLACEHOLDER | `FEATURE_REPORTS` | `Sidebar.tsx:201` |
| ⚙️ | "Configurações" | `handleNavigation('/dashboard/settings')` | `/dashboard/settings` | ⚠️ PLACEHOLDER | `FEATURE_SETTINGS` | `Sidebar.tsx:201` |

### **🚪 Ações do Usuário**
| Botão | Label | Handler | Funcionalidade | Status | Arquivo:Linha |
|-------|-------|---------|----------------|--------|---------------|
| 🚪 | "Sair" | `handleLogout()` | `supabase.auth.signOut()` | ✅ OK | `Sidebar.tsx:269-288` |
| ⬅️➡️ | Colapsar | `toggleSidebar()` | Estado sidebar | ✅ OK | `Sidebar.tsx:173-188` |

---

## ⚠️ BOTÕES MORTOS / PLACEHOLDERS

### **🔴 Botões Sem Handler Real**
| Botão | Local | Handler Atual | Status | Necessita |
|-------|-------|---------------|--------|----------|
| "Adicionar Lead" | `KuveraKanbanBoard` | `console.log()` | 🔴 MORTO | Implementar modal |

### **⚠️ Rotas Placeholder**
| Rota | Componente | Status | Feature Flag |
|------|------------|--------|-------------|
| `/dashboard/users` | `PlaceholderPage` | ⚠️ PLACEHOLDER | `FEATURE_USERS` |
| `/dashboard/automations` | `PlaceholderPage` | ⚠️ PLACEHOLDER | `FEATURE_AUTOMATIONS` |
| `/dashboard/calendar` | `PlaceholderPage` | ⚠️ PLACEHOLDER | `FEATURE_CALENDAR` |
| `/dashboard/reports` | `PlaceholderPage` | ⚠️ PLACEHOLDER | `FEATURE_REPORTS` |
| `/dashboard/settings` | `PlaceholderPage` | ⚠️ PLACEHOLDER | `FEATURE_SETTINGS` |

---

## 🎯 CARDS KUVERA (Links)

### **📱 KuveraInspiredDashboard**
| Card | Label | Handler | Rota | Status |
|------|-------|---------|------|--------|
| 👥 | "Acessar Pipeline" | Link | `/dashboard` | ✅ OK |
| 📊 | "Ver Relatórios" | Link | `/dashboard/reports` | ⚠️ PLACEHOLDER |
| 📅 | "Abrir Calendário" | Link | `/dashboard/calendar` | ⚠️ PLACEHOLDER |
| 🎯 | "Configurar Metas" | Link | `/dashboard/goals` | ❌ NÃO EXISTE |
| 📈 | "Calcular ROI" | Link | `/dashboard/calculator` | ❌ NÃO EXISTE |
| ⚡ | "Ver Automações" | Link | `/dashboard/automations` | ⚠️ PLACEHOLDER |

---

## 📊 RESUMO DO INVENTÁRIO

### **✅ FUNCIONALIDADES COMPLETAS**
- **CRUD Leads:** Criar, Editar, Excluir, Listar ✅
- **Import/Export:** CSV/XLSX ✅
- **Atribuição:** Leads para consultores ✅
- **Drag & Drop:** Kanban funcional ✅
- **Modais:** Todos os principais funcionais ✅
- **Navegação:** Sidebar com feature flags ✅

### **⚠️ PLACEHOLDERS COM FEATURE FLAGS**
- **5 rotas** com PlaceholderPage
- **Feature flags** implementadas corretamente
- **Navegação** oculta itens não implementados

### **🔴 BOTÕES MORTOS (1 ENCONTRADO)**
- **KuveraKanbanBoard:** Botão "Adicionar Lead" só faz `console.log()`

### **❌ ROTAS INEXISTENTES (2 ENCONTRADAS)**
- `/dashboard/goals` (referenciado em KuveraInspiredDashboard)
- `/dashboard/calculator` (referenciado em KuveraInspiredDashboard)

---

**Próximo:** Mapear componentes Kanban e drag & drop
