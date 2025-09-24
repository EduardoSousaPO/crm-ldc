# 🗺️ MAPA DE ROTAS - CRM LDC

**Data:** 22/09/2025  
**Status:** ✅ INVENTÁRIO COMPLETO

---

## 📱 ROTAS DE PÁGINAS (App Router)

### **🏠 Rotas Principais**
| Rota | Arquivo | Componente/Página | Status |
|------|---------|-------------------|--------|
| `/` | `app/page.tsx` | Home (redirect) | ✅ OK |
| `/auth/login` | `app/auth/login/page.tsx` | LoginPage | ✅ OK |
| `/auth/register` | `app/auth/register/page.tsx` | RegisterPage | ✅ OK |

### **📊 Dashboard (Layout Wrapper)**
| Rota | Arquivo | Componente/Página | Status |
|------|---------|-------------------|--------|
| `/dashboard` | `app/dashboard/layout.tsx` | DashboardLayout | ✅ OK |
| `/dashboard` | `app/dashboard/page.tsx` | DashboardPage | ✅ OK |
| `/dashboard/manual` | `app/dashboard/manual/page.tsx` | ManualPage | ✅ OK |
| `/dashboard/automations` | `app/dashboard/automations/page.tsx` | PlaceholderPage | ⚠️ PLACEHOLDER |
| `/dashboard/calendar` | `app/dashboard/calendar/page.tsx` | PlaceholderPage | ⚠️ PLACEHOLDER |
| `/dashboard/reports` | `app/dashboard/reports/page.tsx` | PlaceholderPage | ⚠️ PLACEHOLDER |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | PlaceholderPage | ⚠️ PLACEHOLDER |
| `/dashboard/users` | `app/dashboard/users/page.tsx` | PlaceholderPage | ⚠️ PLACEHOLDER |
| `/dashboard/kuvera` | `app/dashboard/kuvera/page.tsx` | KuveraPage | ✅ OK |
| `/dashboard/kuvera-kanban` | `app/dashboard/kuvera-kanban/page.tsx` | KuveraKanbanPage | ✅ OK |

---

## 🔌 ROTAS DE API

### **🔐 Autenticação**
| Rota | Arquivo | Funcionalidade | Status |
|------|---------|----------------|--------|
| `/api/auth/google/callback` | `app/api/auth/google/callback/route.ts` | OAuth Google | ✅ OK |

### **📇 Leads (CRUD Principal)**
| Rota | Arquivo | Funcionalidade | Status |
|------|---------|----------------|--------|
| `/api/leads` | `app/api/leads/route.ts` | GET/POST leads | ✅ OK |
| `/api/leads/[id]` | `app/api/leads/[id]/route.ts` | GET/PUT/DELETE lead | ✅ OK |
| `/api/leads/import` | `app/api/leads/import/route.ts` | Import CSV/Excel | ✅ OK |
| `/api/leads/export` | `app/api/leads/export/route.ts` | Export CSV/Excel | ✅ OK |
| `/api/leads/auto-import` | `app/api/leads/auto-import/route.ts` | Auto import | ✅ OK |

### **📅 Calendário**
| Rota | Arquivo | Funcionalidade | Status |
|------|---------|----------------|--------|
| `/api/calendar/auth` | `app/api/calendar/auth/route.ts` | Auth calendário | ✅ OK |
| `/api/calendar/events` | `app/api/calendar/events/route.ts` | CRUD eventos | ✅ OK |

### **🤖 Automação e IA**
| Rota | Arquivo | Funcionalidade | Status |
|------|---------|----------------|--------|
| `/api/generate-followup` | `app/api/generate-followup/route.ts` | Gerar follow-ups | ✅ OK |
| `/api/transcribe` | `app/api/transcribe/route.ts` | Transcrição áudio | ✅ OK |

### **🧪 Teste e Debug**
| Rota | Arquivo | Funcionalidade | Status |
|------|---------|----------------|--------|
| `/api/test-automation` | `app/api/test-automation/` | Testes automação | ✅ OK |
| `/api/test-supabase` | `app/api/test-supabase/` | Testes Supabase | ✅ OK |

---

## 🎯 COMPONENTES DE LAYOUT

### **📐 Layouts Principais**
| Componente | Arquivo | Responsabilidade | Status |
|------------|---------|------------------|--------|
| `RootLayout` | `app/layout.tsx` | Layout global | ✅ OK |
| `DashboardLayout` | `app/dashboard/layout.tsx` | Shell dashboard | ✅ OK |
| `Providers` | `app/providers.tsx` | Context providers | ✅ OK |

### **🧭 Navegação**
| Componente | Arquivo | Responsabilidade | Status |
|------------|---------|------------------|--------|
| `Sidebar` | `components/Sidebar.tsx` | Menu lateral | ✅ OK |
| `SidebarContext` | `contexts/SidebarContext.tsx` | Estado sidebar | ✅ OK |

---

## 📊 DASHBOARDS IMPLEMENTADOS

### **👑 Dashboard Admin**
- **Arquivo:** `components/AdminDashboard.tsx`
- **Kanban:** `NotionKanbanBoard`
- **Funcionalidades:** Todos os leads, atribuição, import/export
- **Status:** ✅ FUNCIONAL

### **👤 Dashboard Consultor**
- **Arquivo:** `components/ConsultorDashboard.tsx`
- **Kanban:** `UltraResponsiveKanbanBoard`
- **Funcionalidades:** Leads próprios, export limitado
- **Status:** ✅ FUNCIONAL

### **💼 Dashboard Kuvera**
- **Arquivo:** `components/KuveraInspiredDashboard.tsx`
- **Kanban:** `KuveraKanbanBoard`
- **Status:** ✅ ALTERNATIVO

---

## ⚠️ ROTAS PLACEHOLDER (NÃO IMPLEMENTADAS)

| Rota | Status | Feature Flag |
|------|--------|--------------|
| `/dashboard/automations` | ⚠️ PLACEHOLDER | `NEXT_PUBLIC_FEATURE_AUTOMATIONS` |
| `/dashboard/calendar` | ⚠️ PLACEHOLDER | `NEXT_PUBLIC_FEATURE_CALENDAR` |
| `/dashboard/reports` | ⚠️ PLACEHOLDER | `NEXT_PUBLIC_FEATURE_REPORTS` |
| `/dashboard/settings` | ⚠️ PLACEHOLDER | `NEXT_PUBLIC_FEATURE_SETTINGS` |
| `/dashboard/users` | ⚠️ PLACEHOLDER | `NEXT_PUBLIC_FEATURE_USERS` |

---

## 🔄 REDIRECIONAMENTOS

### **Autenticação**
- `/` → `/dashboard` (se autenticado)
- `/` → `/auth/login` (se não autenticado)
- `/dashboard` → Role-based dashboard

### **Proteção de Rotas**
- Todas as rotas `/dashboard/*` requerem autenticação
- Verificação de role para funcionalidades admin

---

## 📈 MÉTRICAS DO MAPEAMENTO

- **Total de Rotas:** 25+
- **Rotas Funcionais:** 15
- **Rotas Placeholder:** 5
- **APIs Funcionais:** 10+
- **Componentes Principais:** 8

---

**Próximo:** Mapear todos os botões e suas funcionalidades
