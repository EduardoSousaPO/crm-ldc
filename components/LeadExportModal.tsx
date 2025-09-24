'use client'

import { useState, useEffect } from 'react'
import { 
  Download, 
  X, 
  Filter, 
  FileSpreadsheet,
  Calendar,
  Users,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface LeadExportModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  isAdmin: boolean
}

interface ExportFilters {
  status: string[]
  consultorId: string
  origin: string[]
  dateFrom: string
  dateTo: string
  minScore: number | undefined
  maxScore: number | undefined
}

interface ExportSettings {
  format: 'xlsx' | 'csv'
  includeInteractions: boolean
  includeTasks: boolean
  columns: string[]
}

const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', required: true },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Telefone' },
  { id: 'origin', label: 'Origem' },
  { id: 'status', label: 'Status' },
  { id: 'score', label: 'Score' },
  { id: 'consultant', label: 'Consultor' },
  { id: 'notes', label: 'Observações' },
  { id: 'created_at', label: 'Data de Criação' },
  { id: 'updated_at', label: 'Última Atualização' }
]

const LEAD_STATUS_OPTIONS = [
  { value: 'lead_qualificado', label: 'Lead Qualificado' },
  { value: 'initial_contact', label: 'Contato Inicial' },
  { value: 'meeting_scheduled', label: 'Reunião Agendada' },
  { value: 'discovery_call', label: 'Discovery Call' },
  { value: 'proposal_sent', label: 'Proposta Enviada' },
  { value: 'negotiation', label: 'Em Negociação' },
  { value: 'client', label: 'Cliente Ativo' }
]

const ORIGIN_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evento', label: 'Evento' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'importacao', label: 'Importação' },
  { value: 'outros', label: 'Outros' }
]

export function LeadExportModal({ 
  isOpen, 
  onClose, 
  currentUserId, 
  isAdmin 
}: LeadExportModalProps) {
  const [step, setStep] = useState<'filters' | 'settings' | 'exporting' | 'complete'>('filters')
  const [filters, setFilters] = useState<ExportFilters>({
    status: [],
    consultorId: isAdmin ? '' : currentUserId,
    origin: [],
    dateFrom: '',
    dateTo: '',
    minScore: undefined,
    maxScore: undefined
  })
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'xlsx',
    includeInteractions: false,
    includeTasks: false,
    columns: ['name', 'email', 'phone', 'origin', 'status', 'score', 'created_at']
  })
  const [consultors, setConsultors] = useState<any[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportedCount, setExportedCount] = useState(0)

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchConsultors()
    }
  }, [isOpen, isAdmin])

  const fetchConsultors = async () => {
    try {
      // Esta seria uma chamada real para buscar consultores
      // Por enquanto, vamos simular
      setConsultors([
        { id: '1', name: 'João Silva' },
        { id: '2', name: 'Maria Santos' },
        { id: '3', name: 'Pedro Costa' }
      ])
    } catch (error) {
      console.error('Erro ao buscar consultores:', error)
    }
  }

  const handleFilterChange = (key: keyof ExportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleColumnToggle = (columnId: string) => {
    if (columnId === 'name') return // Nome é obrigatório
    
    setSettings(prev => ({
      ...prev,
      columns: prev.columns.includes(columnId)
        ? prev.columns.filter(col => col !== columnId)
        : [...prev.columns, columnId]
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    setStep('exporting')

    try {
      const response = await fetch('/api/leads/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          includeInteractions: settings.includeInteractions,
          includeTasks: settings.includeTasks,
          columns: settings.columns
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na exportação')
      }

      setExportedCount(result.total)

      // Gerar arquivo
      if (settings.format === 'xlsx') {
        exportToExcel(result.data)
      } else {
        exportToCSV(result.data)
      }

      setStep('complete')
      toast.success(`${result.total} leads exportados com sucesso!`)

    } catch (error) {
      console.error('Erro na exportação:', error)
      toast.error('Erro ao exportar leads')
      setStep('settings')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')

    // Ajustar largura das colunas
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }))
    worksheet['!cols'] = colWidths

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const fileName = `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`
    saveAs(blob, fileName)
  }

  const exportToCSV = (data: any[]) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          // Escapar aspas e quebras de linha
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const fileName = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    saveAs(blob, fileName)
  }

  const resetModal = () => {
    setStep('filters')
    setFilters({
      status: [],
      consultorId: isAdmin ? '' : currentUserId,
      origin: [],
      dateFrom: '',
      dateTo: '',
      minScore: undefined,
      maxScore: undefined
    })
    setSettings({
      format: 'xlsx',
      includeInteractions: false,
      includeTasks: false,
      columns: ['name', 'email', 'phone', 'origin', 'status', 'score', 'created_at']
    })
    setExportedCount(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="notion-title text-xl font-semibold text-gray-900">
              Exportar Leads
            </h2>
            <p className="notion-body text-gray-500 text-sm mt-0.5">
              Exporte seus leads em Excel ou CSV
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'filters' && (
            <div className="space-y-6">
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros de Exportação
                </h3>
              </div>

              {/* Status Filter */}
              <div>
                <label className="notion-caption text-gray-600 mb-2 block">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEAD_STATUS_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(option.value)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, option.value]
                            : filters.status.filter(s => s !== option.value)
                          handleFilterChange('status', newStatus)
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="notion-body text-gray-700 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Consultor Filter (Admin only) */}
              {isAdmin && (
                <div>
                  <label className="notion-caption text-gray-600 mb-2 block">Consultor</label>
                  <select
                    value={filters.consultorId}
                    onChange={(e) => handleFilterChange('consultorId', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Todos os consultores</option>
                    {consultors.map(consultor => (
                      <option key={consultor.id} value={consultor.id}>
                        {consultor.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Origin Filter */}
              <div>
                <label className="notion-caption text-gray-600 mb-2 block">Origem</label>
                <div className="grid grid-cols-2 gap-2">
                  {ORIGIN_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.origin.includes(option.value)}
                        onChange={(e) => {
                          const newOrigin = e.target.checked
                            ? [...filters.origin, option.value]
                            : filters.origin.filter(o => o !== option.value)
                          handleFilterChange('origin', newOrigin)
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="notion-body text-gray-700 text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="notion-caption text-gray-600 mb-2 block">Data Inicial</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="notion-caption text-gray-600 mb-2 block">Data Final</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Score Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="notion-caption text-gray-600 mb-2 block">Score Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore || ''}
                    onChange={(e) => handleFilterChange('minScore', e.target.value ? Number(e.target.value) : undefined)}
                    className="input-field w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="notion-caption text-gray-600 mb-2 block">Score Máximo</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore || ''}
                    onChange={(e) => handleFilterChange('maxScore', e.target.value ? Number(e.target.value) : undefined)}
                    className="input-field w-full"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('settings')}
                  className="btn-primary"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {step === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Configurações de Exportação
                </h3>
              </div>

              {/* Format Selection */}
              <div>
                <label className="notion-caption text-gray-600 mb-2 block">Formato</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="xlsx"
                      checked={settings.format === 'xlsx'}
                      onChange={(e) => setSettings(prev => ({ ...prev, format: 'xlsx' }))}
                      className="border-gray-300"
                    />
                    <span className="notion-body text-gray-700">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={settings.format === 'csv'}
                      onChange={(e) => setSettings(prev => ({ ...prev, format: 'csv' }))}
                      className="border-gray-300"
                    />
                    <span className="notion-body text-gray-700">CSV</span>
                  </label>
                </div>
              </div>

              {/* Column Selection */}
              <div>
                <label className="notion-caption text-gray-600 mb-2 block">Colunas para Exportar</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_COLUMNS.map(column => (
                    <label key={column.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.columns.includes(column.id)}
                        onChange={() => handleColumnToggle(column.id)}
                        disabled={column.required}
                        className="rounded border-gray-300 disabled:opacity-50"
                      />
                      <span className="notion-body text-gray-700 text-sm">
                        {column.label} {column.required && '*'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Data */}
              <div>
                <label className="notion-caption text-gray-600 mb-2 block">Dados Adicionais</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.includeInteractions}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        includeInteractions: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="notion-body text-gray-700">Incluir dados de interações</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.includeTasks}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        includeTasks: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="notion-body text-gray-700">Incluir dados de tarefas</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('filters')}
                  className="btn-secondary"
                >
                  Voltar
                </button>
                <button
                  onClick={handleExport}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar Leads
                </button>
              </div>
            </div>
          )}

          {step === 'exporting' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="notion-subtitle text-gray-900 mb-2">Exportando leads...</h3>
              <p className="notion-body text-gray-500">Preparando arquivo para download</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="notion-title text-gray-900 mb-2">Exportação Concluída!</h3>
              <p className="notion-body text-gray-500 mb-6">
                {exportedCount} leads foram exportados com sucesso
              </p>
              <button
                onClick={handleClose}
                className="btn-primary"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
