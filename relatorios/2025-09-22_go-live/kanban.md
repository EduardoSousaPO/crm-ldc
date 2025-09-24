# 🎯 MAPA DO SISTEMA KANBAN - CRM LDC

**Data:** 22/09/2025  
**Status:** ✅ ANÁLISE COMPLETA

---

## 🏗️ IMPLEMENTAÇÕES KANBAN DISPONÍVEIS

### **📊 KANBAN BOARDS IDENTIFICADOS**

| Componente | Arquivo | Usado Em | Drag & Drop | Status |
|------------|---------|----------|-------------|--------|
| `NotionKanbanBoard` | `NotionKanbanBoard.tsx` | AdminDashboard | @dnd-kit | ✅ ATIVO |
| `UltraResponsiveKanbanBoard` | `UltraResponsiveKanbanBoard.tsx` | ConsultorDashboard | @dnd-kit | ✅ ATIVO |
| `OptimizedKanbanBoard` | `OptimizedKanbanBoard.tsx` | - | @dnd-kit | ⚠️ DISPONÍVEL |
| `HighPerformanceKanbanBoard` | `HighPerformanceKanbanBoard.tsx` | - | @dnd-kit | ⚠️ DISPONÍVEL |
| `NativeDragKanbanBoard` | `NativeDragKanbanBoard.tsx` | - | HTML5 Native | ⚠️ DISPONÍVEL |
| `KuveraKanbanBoard` | `KuveraKanbanBoard.tsx` | KuveraPage | @dnd-kit | ⚠️ DISPONÍVEL |
| `KanbanBoard` | `KanbanBoard.tsx` | - | @dnd-kit | ⚠️ GENÉRICO |

---

## 🎨 ESTRUTURA DAS COLUNAS KANBAN

### **📋 COLUNAS PADRÃO (Todos os Boards)**
| ID | Título | Descrição | Fase |
|----|--------|-----------|------|
| `lead_qualificado` | "Lead Qualificado" | "Leads qualificados automaticamente via IA + N8N" | "1. QUALIFICAR" |
| `reuniao_agendada` | "R1 Agendada" | "Primeira reunião de diagnóstico marcada" | "2. REUNIÃO" |
| `proposta_apresentada` | "R2 + Proposta" | "Estudo apresentado, proposta enviada + follow-up" | "3. PROPOSTA" |
| `cliente_ativo` | "Cliente Assinado" | "Contrato assinado - Cliente ativo" | "4. ASSINAR" |

### **🎯 Variação Kuvera (Ícones)**
| Coluna | Ícone | Cor |
|--------|-------|-----|
| Lead Qualificado | `<Target />` | `kuvera-accent-blue` |
| R1 Agendada | `<Calendar />` | `kuvera-accent-green` |
| R2 + Proposta | `<FileText />` | `kuvera-accent-yellow` |
| Cliente Assinado | `<CheckCircle />` | `kuvera-accent-purple` |

---

## 🔄 SISTEMA DRAG & DROP

### **✅ IMPLEMENTAÇÕES FUNCIONAIS**

#### **1️⃣ NotionKanbanBoard (AdminDashboard)**
```typescript
// Arquivo: components/NotionKanbanBoard.tsx
// Tecnologia: @dnd-kit
// Status: ✅ FUNCIONAL

const handleDragStart = useCallback((event: DragStartEvent) => {
  setActiveId(event.active.id as string)
  setDraggedLead(leads.find(lead => lead.id === event.active.id) || null)
}, [leads])

const handleDragEnd = useCallback(async (event: DragEndEvent) => {
  const { active, over } = event
  setActiveId(null)
  setDraggedLead(null)

  if (active.id !== over?.id) {
    const leadId = active.id as string
    const newStatus = over?.id as LeadStatus

    if (newStatus && KANBAN_COLUMNS.some(col => col.id === newStatus)) {
      try {
        await onUpdateLead(leadId, { status: newStatus })
        toast.success(`Lead movido para ${KANBAN_COLUMNS.find(col => col.id === newStatus)?.title}`)
      } catch (error) {
        console.error('Erro ao mover lead:', error)
        toast.error('Erro ao mover lead')
      }
    }
  }
}, [onUpdateLead])
```

#### **2️⃣ UltraResponsiveKanbanBoard (ConsultorDashboard)**
```typescript
// Arquivo: components/UltraResponsiveKanbanBoard.tsx
// Tecnologia: @dnd-kit
// Status: ✅ FUNCIONAL
// Otimização: Ultra-responsivo, sem delays

const handleDragEnd = useCallback(async (event: DragEndEvent) => {
  const { active, over } = event
  
  // Limpar estado imediatamente para UX instantânea
  setActiveId(null)
  
  if (!over || !onUpdateLead || !draggedLeadRef.current || updateInProgressRef.current) {
    draggedLeadRef.current = null
    return
  }

  const leadId = active.id as string
  const newStatus = over.id as LeadStatus
  const lead = draggedLeadRef.current

  // Verificar se realmente mudou de status
  if (lead.status === newStatus) {
    draggedLeadRef.current = null
    return
  }

  // Prevenir múltiplas atualizações simultâneas
  updateInProgressRef.current = true

  try {
    // Atualização direta - SEM loading toast para performance
    await onUpdateLead(leadId, { status: newStatus })
    
    // Toast mínimo apenas no final
    const column = KANBAN_COLUMNS.find(col => col.id === newStatus)
    toast.success(`→ ${column?.title}`, {
      duration: 1000,
      position: 'bottom-right',
    })
  } catch (error) {
    console.error('Erro ao mover lead:', error)
    toast.error('Erro ao mover', {
      duration: 1500,
      position: 'bottom-right',
    })
  } finally {
    draggedLeadRef.current = null
    updateInProgressRef.current = false
  }
}, [onUpdateLead])
```

#### **3️⃣ NativeDragKanbanBoard (HTML5 Nativo)**
```typescript
// Arquivo: components/NativeDragKanbanBoard.tsx
// Tecnologia: HTML5 Drag & Drop API (Nativo)
// Status: ⚠️ DISPONÍVEL
// Vantagem: Sem dependência externa

const handleDragStart = useCallback((lead: Lead) => {
  setDraggedLead(lead)
  document.body.style.cursor = 'grabbing'
}, [])

const handleDrop = useCallback(async (columnId: LeadStatus) => {
  if (!draggedLead || !onUpdateLead || updateInProgressRef.current) {
    return
  }

  // Verificar se mudou de coluna
  if (draggedLead.status === columnId) {
    setDraggedLead(null)
    setDragOverColumn(null)
    document.body.style.cursor = 'default'
    return
  }

  updateInProgressRef.current = true

  try {
    await onUpdateLead(draggedLead.id, { status: columnId })
    // Success feedback
  } catch (error) {
    // Error handling
  } finally {
    setDraggedLead(null)
    setDragOverColumn(null)
    document.body.style.cursor = 'default'
    updateInProgressRef.current = false
  }
}, [draggedLead, onUpdateLead])
```

---

## 📱 CARDS DE LEAD

### **🃏 TIPOS DE CARDS DISPONÍVEIS**

| Componente | Arquivo | Usado Em | Funcionalidades | Status |
|------------|---------|----------|----------------|--------|
| `LeadCard` | `LeadCard.tsx` | Boards principais | Click → Modal, Drag | ✅ PRINCIPAL |
| `ModernLeadCard` | `ModernLeadCard.tsx` | - | Design moderno | ⚠️ DISPONÍVEL |
| `SimpleLeadCard` | `SimpleLeadCard.tsx` | - | Versão simples | ⚠️ DISPONÍVEL |
| `VirtualizedLeadCard` | `VirtualizedLeadCard.tsx` | HighPerformance | Virtualização | ⚠️ DISPONÍVEL |
| `NativeDragLeadCard` | `NativeDragLeadCard.tsx` | NativeDrag | HTML5 Drag | ⚠️ DISPONÍVEL |

### **🎯 LeadCard Principal (Ativo)**
```typescript
// Arquivo: components/LeadCard.tsx
// Funcionalidades:
// ✅ Drag & Drop com @dnd-kit
// ✅ Click para abrir OptimizedLeadModal
// ✅ Menu de ações
// ✅ Score visual
// ✅ Informações do lead

export function LeadCard({ lead, isDragging = false, onUpdate, currentUserId }: LeadCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook,
  } = useDraggable({
    id: lead.id,
  })

  // Click handler para abrir modal
  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || !e.defaultPrevented) {
      setIsDetailModalOpen(true)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleCardClick}
        className="..."
      >
        {/* Card content */}
      </div>

      {/* Modal de Detalhes */}
      <OptimizedLeadModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        lead={lead}
        onUpdate={onUpdate}
      />
    </>
  )
}
```

---

## 🔌 INTEGRAÇÃO COM APIs

### **📡 Fluxo de Atualização do Status**

```mermaid
graph TD
    A[Drag Start] --> B[Set ActiveId]
    B --> C[User Drags Lead]
    C --> D[Drop on Column]
    D --> E{Status Changed?}
    E -->|Yes| F[Call onUpdateLead]
    E -->|No| G[Reset State]
    F --> H[PUT /api/leads/[id]]
    H --> I{API Success?}
    I -->|Yes| J[Update React Query Cache]
    I -->|No| K[Show Error Toast]
    J --> L[Show Success Toast]
    K --> G
    L --> G
    G --> M[Reset Drag State]
```

### **🎯 API Endpoints Usados**

| Ação | Endpoint | Método | Payload | Resposta |
|------|----------|--------|---------|----------|
| Mover Lead | `/api/leads/[id]` | PUT | `{status: LeadStatus}` | Lead atualizado |
| Criar Lead | `/api/leads` | POST | Lead completo | Lead criado |
| Buscar Leads | `/api/leads` | GET | Query params | Array de leads |

---

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### **🚀 UltraResponsiveKanbanBoard**
- **Refs para estado:** `draggedLeadRef.current` evita re-renders
- **Update lock:** `updateInProgressRef.current` previne múltiplas atualizações
- **Toast mínimo:** Apenas 1000ms de duração
- **Estado limpo imediato:** UX instantânea

### **🎯 HighPerformanceKanbanBoard**
- **Memoização:** `useMemo` para leads por coluna
- **Virtualization:** `VirtualizedLeadCard` para listas grandes
- **Drag overlay otimizado:** 200ms de animação

### **⚡ NativeDragKanbanBoard**
- **HTML5 nativo:** Sem dependência @dnd-kit
- **Cursor feedback:** Visual imediato
- **Update lock:** Previne conflitos

---

## 🎨 DASHBOARDS E SEUS KANBAN

### **👑 AdminDashboard**
```typescript
// Arquivo: components/AdminDashboard.tsx
// Kanban: NotionKanbanBoard
// Funcionalidades: Todos os leads, Import/Export/Assign

<NotionKanbanBoard
  leads={leads}
  onUpdateLead={handleUpdateLead}
  onCreateLead={handleCreateLead}
  userRole="admin"
  userName={currentUser.name || currentUser.email || 'Admin'}
  onImport={() => setIsImportModalOpen(true)}
  onExport={() => setIsExportModalOpen(true)}
  onAssignLeads={() => setIsAssignmentModalOpen(true)}
/>
```

### **👤 ConsultorDashboard**
```typescript
// Arquivo: components/ConsultorDashboard.tsx
// Kanban: UltraResponsiveKanbanBoard
// Funcionalidades: Leads próprios, Export limitado

<UltraResponsiveKanbanBoard 
  leads={leads}
  onUpdateLead={handleUpdateLead}
  onLeadCreate={handleCreateLead}
  currentUserId={currentUser.id}
  isAdmin={false}
/>
```

### **💼 KuveraPage**
```typescript
// Arquivo: app/dashboard/kuvera/page.tsx
// Kanban: KuveraKanbanBoard
// Status: ⚠️ ALTERNATIVO (não usado no fluxo principal)

<KuveraKanbanBoard
  leads={leads}
  onUpdateLead={onUpdateLead}
  onCreateLead={onCreateLead}
  userRole={userRole}
/>
```

---

## 🔍 ANÁLISE DE DUPLICAÇÃO

### **🚨 COMPONENTES DUPLICADOS**

#### **Kanban Boards (7 implementações)**
1. **✅ ATIVO:** `NotionKanbanBoard` (AdminDashboard)
2. **✅ ATIVO:** `UltraResponsiveKanbanBoard` (ConsultorDashboard)
3. **⚠️ DISPONÍVEL:** `OptimizedKanbanBoard` (não usado)
4. **⚠️ DISPONÍVEL:** `HighPerformanceKanbanBoard` (não usado)
5. **⚠️ DISPONÍVEL:** `NativeDragKanbanBoard` (não usado)
6. **⚠️ DISPONÍVEL:** `KuveraKanbanBoard` (usado apenas em Kuvera)
7. **⚠️ DISPONÍVEL:** `KanbanBoard` (genérico, não usado)

#### **Lead Cards (5 implementações)**
1. **✅ ATIVO:** `LeadCard` (principal)
2. **⚠️ DISPONÍVEL:** `ModernLeadCard` (não usado)
3. **⚠️ DISPONÍVEL:** `SimpleLeadCard` (não usado)
4. **⚠️ DISPONÍVEL:** `VirtualizedLeadCard` (usado em HighPerformance)
5. **⚠️ DISPONÍVEL:** `NativeDragLeadCard` (usado em NativeDrag)

---

## 🎯 RECOMENDAÇÕES

### **✅ MANTER (Componentes Ativos)**
- `NotionKanbanBoard` → AdminDashboard
- `UltraResponsiveKanbanBoard` → ConsultorDashboard
- `LeadCard` → Cards principais

### **🔄 CONSIDERAR REMOÇÃO**
- `OptimizedKanbanBoard` → Não usado
- `HighPerformanceKanbanBoard` → Não usado
- `NativeDragKanbanBoard` → Não usado
- `KanbanBoard` → Genérico, não usado
- `ModernLeadCard` → Não usado
- `SimpleLeadCard` → Não usado

### **⚠️ MANTER COMO BACKUP**
- `KuveraKanbanBoard` → Usado em página alternativa
- `VirtualizedLeadCard` → Para listas grandes (futuro)
- `NativeDragLeadCard` → HTML5 nativo (backup)

---

## 📊 RESUMO TÉCNICO

### **🎯 Kanban Ativo (2 implementações)**
- **Admin:** NotionKanbanBoard + @dnd-kit
- **Consultor:** UltraResponsiveKanbanBoard + @dnd-kit
- **Status:** ✅ FUNCIONAIS

### **🔄 Drag & Drop**
- **Tecnologia:** @dnd-kit (principal)
- **Fallback:** HTML5 nativo (NativeDragKanbanBoard)
- **API:** `PUT /api/leads/[id]` para atualizar status
- **Cache:** React Query invalidation

### **📱 Cards**
- **Principal:** LeadCard + OptimizedLeadModal
- **Funcionalidades:** Drag, Click, Menu, Score
- **Status:** ✅ FUNCIONAL

### **🧹 Limpeza Necessária**
- **5 Kanban boards** não usados
- **3 Lead cards** não usados
- **Manter apenas** componentes ativos + backups estratégicos

---

**Próximo:** Implementar layout full-width e correção da "faixa"
