# Componentes Removidos - Backup

**Data:** 22/09/2025  
**Motivo:** Deduplicação e limpeza de código

---

## 🗑️ Componentes neste backup:

1. **OptimizedKanbanBoard.tsx** - Kanban não utilizado em lugar nenhum
2. **KanbanBoard.tsx** - Kanban genérico não utilizado  
3. **SimpleLeadCard.tsx** - Card substituído por LeadCard padrão
4. **ModernLeadCard.tsx** - Card substituído por LeadCard padrão
5. **DragDropTestSuite.tsx** - Testes movidos para Playwright E2E
6. **DragFeedback.tsx** - Feedback não utilizado

---

## 🔄 Como restaurar:

1. Copiar arquivo desejado de volta para `components/`
2. Atualizar imports nos componentes que usam
3. Verificar compatibilidade com versão atual
4. Executar `npm run build` para verificar

---

## ⚠️ Componentes mantidos como alternativa:

- **HighPerformanceKanbanBoard** - Para listas muito grandes (virtualização)
- **NativeDragKanbanBoard** - Fallback sem @dnd-kit (HTML5 nativo)
- **KuveraKanbanBoard** - Interface alternativa (página Kuvera)

---

## 📋 Substituições realizadas:

### SimpleLeadCard → LeadCard
- **Arquivo:** `UltraResponsiveKanbanColumn.tsx`
- **Motivo:** Unificação em um card padrão

### ModernLeadCard → LeadCard  
- **Arquivo:** `KanbanColumn.tsx`
- **Motivo:** Unificação em um card padrão

### Imports removidos:
- `SimpleLeadCard` de `UltraResponsiveKanbanBoard.tsx` (não estava sendo usado)

---

## 🎯 Componentes ativos finais:

1. `NotionKanbanBoard` - Dashboard Admin
2. `UltraResponsiveKanbanBoard` - Dashboard Consultor
3. `LeadCard` - Card padrão unificado
4. `KanbanColumn` - Coluna genérica
5. `UltraResponsiveKanbanColumn` - Coluna otimizada
