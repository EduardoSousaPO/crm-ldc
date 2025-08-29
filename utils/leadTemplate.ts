import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface LeadTemplateData {
  Nome: string
  Email: string
  Telefone: string
  Origem: string
  Observações: string
}

export const TEMPLATE_DATA: LeadTemplateData[] = [
  {
    Nome: 'João Silva',
    Email: 'joao.silva@email.com',
    Telefone: '(11) 99999-9999',
    Origem: 'website',
    Observações: 'Interessado em investimentos de renda fixa'
  },
  {
    Nome: 'Maria Santos',
    Email: 'maria.santos@email.com',
    Telefone: '(11) 88888-8888',
    Origem: 'indicacao',
    Observações: 'Indicação de cliente atual'
  },
  {
    Nome: 'Pedro Costa',
    Email: 'pedro.costa@email.com',
    Telefone: '(11) 77777-7777',
    Origem: 'linkedin',
    Observações: 'Perfil executivo, interessado em fundos'
  }
]

export const downloadLeadTemplate = () => {
  try {
    // Criar worksheet com dados de exemplo
    const worksheet = XLSX.utils.json_to_sheet(TEMPLATE_DATA)
    
    // Criar workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Leads')
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 20 }, // Nome
      { wch: 25 }, // Email
      { wch: 18 }, // Telefone
      { wch: 15 }, // Origem
      { wch: 40 }  // Observações
    ]
    worksheet['!cols'] = colWidths
    
    // Adicionar comentários nas células de cabeçalho
    const headerComments = {
      A1: 'Nome completo do lead (obrigatório)',
      B1: 'Email válido (obrigatório se não tiver telefone)',
      C1: 'Telefone com DDD (obrigatório se não tiver email)',
      D1: 'Origem do lead: website, indicacao, linkedin, whatsapp, evento, cold_call, outros',
      E1: 'Observações adicionais sobre o lead'
    }
    
    Object.entries(headerComments).forEach(([cell, comment]) => {
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' }
      worksheet[cell].c = [{ a: 'Template', t: comment }]
    })
    
    // Gerar arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // Download
    const fileName = `template_importacao_leads_${new Date().toISOString().split('T')[0]}.xlsx`
    saveAs(blob, fileName)
    
    return true
  } catch (error) {
    console.error('Erro ao gerar template:', error)
    return false
  }
}

export const COLUMN_MAPPING_GUIDE = {
  'Nome': {
    required: true,
    description: 'Nome completo do lead',
    examples: ['João Silva', 'Maria Santos']
  },
  'Email': {
    required: false,
    description: 'Email válido (obrigatório se não tiver telefone)',
    examples: ['joao@email.com', 'maria.santos@empresa.com']
  },
  'Telefone': {
    required: false,
    description: 'Telefone com DDD (obrigatório se não tiver email)',
    examples: ['(11) 99999-9999', '11999999999', '+5511999999999']
  },
  'Origem': {
    required: false,
    description: 'Origem do lead',
    examples: ['website', 'indicacao', 'linkedin', 'whatsapp', 'evento', 'cold_call', 'outros']
  },
  'Observações': {
    required: false,
    description: 'Informações adicionais sobre o lead',
    examples: ['Interessado em renda fixa', 'Cliente premium', 'Urgente']
  }
}
