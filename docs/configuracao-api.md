# 🔧 CONFIGURAÇÃO DA API AUTO-IMPORT

## 📋 ENDPOINT PRINCIPAL

**URL:** `POST /api/leads/auto-import`

**Finalidade:** Receber leads qualificados automaticamente do processo de IA + N8N + WAHA

---

## 🔐 AUTENTICAÇÃO

### Header Obrigatório
```bash
x-api-key: SUA_CHAVE_SECRETA_AQUI
```

**Configuração:**
1. Defina `CRM_API_KEY` no arquivo `.env.local`
2. Use a mesma chave no N8N/WAHA para autenticação

---

## 📥 FORMATO DOS DADOS

### Lead Único
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "origin": "WhatsApp Bot",
  "score": 85,
  "notes": "Interessado em renda fixa",
  "consultant_id": "uuid-do-consultor", // Opcional
  "qualification_data": {
    "source": "waha", // n8n | waha | google_sheets
    "ai_score": 85,
    "qualification_notes": "Cliente qualificado com patrimônio ~100k",
    "contact_preference": "whatsapp" // whatsapp | email | phone
  }
}
```

### Múltiplos Leads
```json
[
  {
    "name": "João Silva",
    "email": "joao@email.com",
    // ... resto dos dados
  },
  {
    "name": "Maria Santos",
    "phone": "+5511888888888",
    // ... resto dos dados
  }
]
```

---

## 📤 RESPOSTA DA API

### Sucesso
```json
{
  "success": true,
  "message": "Processados 2 leads: 1 criados, 1 atualizados, 0 falharam",
  "stats": {
    "total": 2,
    "created": 1,
    "updated": 1,
    "failed": 0
  },
  "results": [
    {
      "success": true,
      "action": "created",
      "leadId": "uuid-do-lead-criado",
      "data": { /* dados originais */ }
    },
    {
      "success": true,
      "action": "updated", 
      "leadId": "uuid-do-lead-atualizado",
      "data": { /* dados originais */ }
    }
  ]
}
```

### Erro
```json
{
  "error": "Unauthorized - Invalid API key",
  "details": "Chave de API inválida ou ausente"
}
```

---

## 🔄 INTEGRAÇÃO COM N8N

### Configuração do Webhook N8N

1. **Crie um workflow** no N8N
2. **Adicione Webhook Node:**
   - URL: `https://seu-crm.vercel.app/api/leads/auto-import`
   - Método: `POST`
   - Headers: `x-api-key: SUA_CHAVE_SECRETA`

3. **Formato dos dados enviados:**
```javascript
// No N8N, configure o body do webhook:
{
  "name": "{{ $json.nome }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.telefone }}",
  "origin": "Qualificação N8N",
  "qualification_data": {
    "source": "n8n",
    "ai_score": {{ $json.score_ia }},
    "qualification_notes": "{{ $json.observacoes }}",
    "contact_preference": "{{ $json.preferencia_contato }}"
  }
}
```

---

## 📱 INTEGRAÇÃO COM WAHA

### Configuração WAHA Bot

```javascript
// Exemplo de webhook WAHA para CRM
const webhookData = {
  name: message.contact.name,
  phone: message.from,
  origin: "WhatsApp WAHA",
  qualification_data: {
    source: "waha",
    ai_score: calculateScore(message.body),
    qualification_notes: `Mensagem inicial: ${message.body}`,
    contact_preference: "whatsapp"
  }
}

// Enviar para CRM
fetch('https://seu-crm.vercel.app/api/leads/auto-import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'SUA_CHAVE_SECRETA'
  },
  body: JSON.stringify(webhookData)
})
```

---

## 📊 INTEGRAÇÃO COM GOOGLE SHEETS

### Configuração Google Apps Script

```javascript
function enviarLeadParaCRM() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const data = sheet.getDataRange().getValues()
  
  // Pular header (primeira linha)
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    
    const leadData = {
      name: row[0], // Coluna A
      email: row[1], // Coluna B  
      phone: row[2], // Coluna C
      origin: "Google Sheets",
      score: row[3] || 50, // Coluna D
      qualification_data: {
        source: "google_sheets",
        ai_score: row[3] || 50,
        qualification_notes: row[4] || "", // Coluna E
        contact_preference: row[5] || "email" // Coluna F
      }
    }
    
    // Enviar para CRM
    const response = UrlFetchApp.fetch('https://seu-crm.vercel.app/api/leads/auto-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'SUA_CHAVE_SECRETA'
      },
      payload: JSON.stringify(leadData)
    })
    
    console.log('Lead enviado:', response.getContentText())
  }
}
```

---

## ✅ AUTOMAÇÕES APÓS IMPORTAÇÃO

### O que acontece automaticamente:

1. **Lead criado** na coluna "Lead Qualificado"
2. **Consultor atribuído** automaticamente (distribuição por carga)
3. **Tarefa criada** para primeiro contato (prazo: 24h)
4. **Score calculado** baseado nos dados da IA
5. **Notas organizadas** com origem e observações

### Validações automáticas:

- ✅ **Duplicatas detectadas** (por email ou telefone)
- ✅ **Score atualizado** se maior que o existente
- ✅ **Distribuição equilibrada** entre consultores
- ✅ **Logs completos** de importação

---

## 🧪 TESTE DA API

### Teste Manual (curl)
```bash
curl -X POST https://seu-crm.vercel.app/api/leads/auto-import \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE_SECRETA" \
  -d '{
    "name": "Teste API",
    "email": "teste@email.com",
    "phone": "+5511999999999",
    "origin": "Teste Manual",
    "qualification_data": {
      "source": "n8n",
      "ai_score": 80,
      "qualification_notes": "Lead de teste da API",
      "contact_preference": "email"
    }
  }'
```

### Teste de Conectividade
```bash
curl -X GET https://seu-crm.vercel.app/api/leads/auto-import
```

**Resposta esperada:**
```json
{
  "message": "CRM Auto-Import API ativa",
  "timestamp": "2024-01-26T10:30:00.000Z",
  "endpoints": {
    "POST": "/api/leads/auto-import - Importar leads qualificados"
  }
}
```

---

## 🚨 MONITORAMENTO E LOGS

### Logs Disponíveis
- ✅ **Logs de importação** no console do Vercel
- ✅ **Estatísticas** na resposta da API
- ✅ **Erros detalhados** para debugging
- ✅ **Histórico** no Supabase

### Métricas Importantes
- **Taxa de sucesso** das importações
- **Tempo médio** de processamento  
- **Leads duplicados** detectados
- **Distribuição** entre consultores

---

*Configuração atualizada: Janeiro 2024*  
*Versão: 2.0 - Processo LDC Otimizado*

