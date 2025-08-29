'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { downloadLeadTemplate } from '@/utils/leadTemplate'

interface LeadImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
  currentUserId: string
  isAdmin: boolean
}

interface ParsedLead {
  name: string
  email?: string
  phone?: string
  origin?: string
  notes?: string
}

interface ImportResult {
  success: boolean
  imported: number
  errors: Array<{
    row: number
    data: any
    error: string
  }>
  duplicates: Array<{
    row: number
    email: string
    existingId: string
  }>
}

const COLUMN_MAPPING = {
  'nome': 'name',
  'name': 'name',
  'email': 'email',
  'e-mail': 'email',
  'telefone': 'phone',
  'phone': 'phone',
  'celular': 'phone',
  'origem': 'origin',
  'origin': 'origin',
  'source': 'origin',
  'observações': 'notes',
  'notes': 'notes',
  'comentários': 'notes',
  'comments': 'notes'
}

export function LeadImportModal({ 
  isOpen, 
  onClose, 
  onImportComplete, 
  currentUserId, 
  isAdmin 
}: LeadImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'results'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mappedData, setMappedData] = useState<ParsedLead[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importSettings, setImportSettings] = useState({
    consultorId: currentUserId,
    distributeEvenly: false
  })
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFile(file)
    parseFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const parseFile = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        let data: any[] = []
        let headers: string[] = []

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const text = e.target?.result as string
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
          data = parsed.data
          headers = parsed.meta.fields || []
        } else {
          // Parse Excel
          const workbook = XLSX.read(e.target?.result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (jsonData.length > 0) {
            headers = jsonData[0] as string[]
            data = jsonData.slice(1).map((row: any) => {
              const obj: any = {}
              headers.forEach((header, index) => {
                obj[header] = row[index] || ''
              })
              return obj
            })
          }
        }

        setRawData(data)
        setHeaders(headers)
        
        // Auto-mapear colunas
        const autoMapping: Record<string, string> = {}
        headers.forEach(header => {
          const normalizedHeader = header.toLowerCase().trim()
          const mappedField = COLUMN_MAPPING[normalizedHeader as keyof typeof COLUMN_MAPPING]
          if (mappedField) {
            autoMapping[header] = mappedField
          }
        })
        setColumnMapping(autoMapping)
        
        setStep('mapping')
        toast.success(`Arquivo carregado: ${data.length} linhas encontradas`)
      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        toast.error('Erro ao processar arquivo. Verifique o formato.')
      }
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }

  const handleColumnMappingChange = (header: string, field: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [header]: field
    }))
  }

  const generatePreview = () => {
    const mapped = rawData.slice(0, 10).map(row => {
      const lead: ParsedLead = { name: '' }
      
      Object.entries(columnMapping).forEach(([header, field]) => {
        if (field && row[header]) {
          (lead as any)[field] = String(row[header]).trim()
        }
      })
      
      return lead
    })
    
    setMappedData(mapped)
    setStep('preview')
  }

  const handleImport = async () => {
    setIsImporting(true)
    setStep('importing')

    try {
      // Mapear todos os dados
      const allMappedData = rawData.map(row => {
        const lead: ParsedLead = { name: '' }
        
        Object.entries(columnMapping).forEach(([header, field]) => {
          if (field && row[header]) {
            (lead as any)[field] = String(row[header]).trim()
          }
        })
        
        return lead
      }).filter(lead => lead.name) // Filtrar leads sem nome

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leads: allMappedData,
          consultorId: importSettings.consultorId,
          distributeEvenly: importSettings.distributeEvenly
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na importação')
      }

      setImportResult(result)
      setStep('results')
      
      if (result.imported > 0) {
        toast.success(`${result.imported} leads importados com sucesso!`)
        onImportComplete()
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error('Erro ao importar leads')
      setStep('preview')
    } finally {
      setIsImporting(false)
    }
  }

  const resetModal = () => {
    setStep('upload')
    setFile(null)
    setRawData([])
    setHeaders([])
    setMappedData([])
    setColumnMapping({})
    setImportResult(null)
    setIsImporting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="notion-title text-xl font-semibold text-gray-900">
              Importar Leads
            </h2>
            <p className="notion-body text-gray-500 text-sm mt-0.5">
              Importe leads via Excel (.xlsx) ou CSV
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
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="notion-subtitle text-gray-900 mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
                </h3>
                <p className="notion-body text-gray-500 text-sm">
                  Formatos suportados: .xlsx, .xls, .csv (máx. 10MB)
                </p>
              </div>

              {/* Template Download */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <h4 className="notion-subtitle text-gray-900">Template de Exemplo</h4>
                    <p className="notion-caption text-gray-500">
                      Baixe um template com as colunas recomendadas
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const success = downloadLeadTemplate()
                      if (success) {
                        toast.success('Template baixado com sucesso!')
                      } else {
                        toast.error('Erro ao baixar template')
                      }
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-2">
                  Mapeamento de Colunas
                </h3>
                <p className="notion-body text-gray-500 text-sm">
                  Associe as colunas do seu arquivo aos campos do sistema
                </p>
              </div>

              <div className="grid gap-4">
                {headers.map(header => (
                  <div key={header} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="notion-subtitle text-gray-900">{header}</span>
                    </div>
                    <div className="w-48">
                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) => handleColumnMappingChange(header, e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">Ignorar coluna</option>
                        <option value="name">Nome *</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefone</option>
                        <option value="origin">Origem</option>
                        <option value="notes">Observações</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="btn-secondary"
                >
                  Voltar
                </button>
                <button
                  onClick={generatePreview}
                  disabled={!columnMapping.name}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Visualizar Dados
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="notion-subtitle text-gray-900 mb-2">
                  Prévia dos Dados
                </h3>
                <p className="notion-body text-gray-500 text-sm">
                  Primeiras 10 linhas do arquivo (total: {rawData.length})
                </p>
              </div>

              {/* Import Settings */}
              {isAdmin && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="notion-subtitle text-gray-900">Configurações de Importação</h4>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importSettings.distributeEvenly}
                      onChange={(e) => setImportSettings(prev => ({
                        ...prev,
                        distributeEvenly: e.target.checked
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="notion-body text-gray-700">
                      Distribuir leads automaticamente entre consultores
                    </span>
                  </label>
                </div>
              )}

              {/* Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 notion-caption text-gray-600">Nome</th>
                      <th className="text-left py-2 px-3 notion-caption text-gray-600">Email</th>
                      <th className="text-left py-2 px-3 notion-caption text-gray-600">Telefone</th>
                      <th className="text-left py-2 px-3 notion-caption text-gray-600">Origem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedData.map((lead, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 px-3 notion-body text-gray-900">{lead.name}</td>
                        <td className="py-2 px-3 notion-body text-gray-700">{lead.email || '-'}</td>
                        <td className="py-2 px-3 notion-body text-gray-700">{lead.phone || '-'}</td>
                        <td className="py-2 px-3 notion-body text-gray-700">{lead.origin || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('mapping')}
                  className="btn-secondary"
                >
                  Voltar
                </button>
                <button
                  onClick={handleImport}
                  className="btn-primary flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Importar {rawData.length} Leads
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="notion-subtitle text-gray-900 mb-2">Importando leads...</h3>
              <p className="notion-body text-gray-500">Processando {rawData.length} registros</p>
            </div>
          )}

          {step === 'results' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="notion-title text-gray-900 mb-2">Importação Concluída!</h3>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-minimal text-center">
                  <div className="text-2xl font-semibold text-green-600 mb-1">
                    {importResult.imported}
                  </div>
                  <div className="notion-caption text-gray-500">Importados</div>
                </div>
                
                <div className="card-minimal text-center">
                  <div className="text-2xl font-semibold text-red-600 mb-1">
                    {importResult.errors.length}
                  </div>
                  <div className="notion-caption text-gray-500">Erros</div>
                </div>
                
                <div className="card-minimal text-center">
                  <div className="text-2xl font-semibold text-amber-600 mb-1">
                    {importResult.duplicates.length}
                  </div>
                  <div className="notion-caption text-gray-500">Duplicatas</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="notion-subtitle text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Erros Encontrados
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="notion-caption text-red-700">
                        Linha {error.row}: {error.error}
                      </div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div className="notion-caption text-red-600">
                        ... e mais {importResult.errors.length - 5} erros
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {importResult.duplicates.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="notion-subtitle text-amber-900 mb-2">
                    Duplicatas Ignoradas
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.duplicates.slice(0, 5).map((dup, index) => (
                      <div key={index} className="notion-caption text-amber-700">
                        Linha {dup.row}: {dup.email} (já existe)
                      </div>
                    ))}
                    {importResult.duplicates.length > 5 && (
                      <div className="notion-caption text-amber-600">
                        ... e mais {importResult.duplicates.length - 5} duplicatas
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleClose}
                  className="btn-primary"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
