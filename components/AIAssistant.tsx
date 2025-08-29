'use client'

import { useState } from 'react'
import { Sparkles, Mail, MessageSquare, Copy, Send, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AIAssistantProps {
  leadId: string
}

interface FollowUpContent {
  assunto?: string
  corpo?: string
  mensagem?: string
  tipo: 'email' | 'whatsapp'
}

export function AIAssistant({ leadId }: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [followUpContent, setFollowUpContent] = useState<FollowUpContent | null>(null)
  const [context, setContext] = useState('')
  const [selectedType, setSelectedType] = useState<'email' | 'whatsapp'>('email')

  const generateFollowUp = async () => {
    if (!context.trim()) {
      toast.error('Por favor, adicione um contexto para o follow-up')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          context,
          type: selectedType,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha na geração de follow-up')
      }

      const result = await response.json()
      
      if (result.success) {
        setFollowUpContent(result.followUp)
        toast.success('Follow-up gerado com sucesso!')
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro na geração:', error)
      toast.error('Erro ao gerar follow-up')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado para área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast.error('Erro ao copiar texto')
    }
  }

  const clearGeneration = () => {
    setFollowUpContent(null)
    setContext('')
  }

  return (
    <div className="card-minimal">
      <div className="flex items-center justify-between mb-4">
        <h3 className="notion-subtitle text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <span>Assistente de Follow-up IA</span>
        </h3>
      </div>

      {!followUpContent ? (
        <div className="space-y-4">
          {/* Seleção de Tipo */}
          <div>
            <label className="notion-caption text-gray-600 mb-2 block">
              Tipo de Follow-up
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('email')}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedType === 'email'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <Mail className="w-4 h-4" />
                E-mail
              </button>
              <button
                onClick={() => setSelectedType('whatsapp')}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedType === 'whatsapp'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Contexto */}
          <div>
            <label className="notion-caption text-gray-600 mb-2 block">
              Contexto da Conversa
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="input-field w-full h-24 resize-none"
              placeholder="Descreva o contexto da última conversa, pontos importantes discutidos, próximos passos, etc..."
            />
          </div>

          {/* Botão Gerar */}
          <button
            onClick={generateFollowUp}
            disabled={isGenerating || !context.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando follow-up...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gerar Follow-up
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Conteúdo Gerado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {followUpContent.tipo === 'email' ? (
              <div className="space-y-3">
                <div>
                  <label className="notion-caption text-blue-900 font-medium">Assunto:</label>
                  <div className="bg-white rounded-md p-2 mt-1 border border-blue-200">
                    <p className="notion-body text-gray-900">{followUpContent.assunto}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(followUpContent.assunto || '')}
                    className="mt-1 text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar assunto
                  </button>
                </div>
                
                <div>
                  <label className="notion-caption text-blue-900 font-medium">Corpo do E-mail:</label>
                  <div className="bg-white rounded-md p-3 mt-1 border border-blue-200">
                    <pre className="notion-body text-gray-900 whitespace-pre-wrap font-sans">
                      {followUpContent.corpo}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(followUpContent.corpo || '')}
                    className="mt-1 text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar e-mail
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="notion-caption text-green-900 font-medium">Mensagem WhatsApp:</label>
                <div className="bg-white rounded-md p-3 mt-1 border border-green-200">
                  <pre className="notion-body text-gray-900 whitespace-pre-wrap font-sans">
                    {followUpContent.mensagem}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(followUpContent.mensagem || '')}
                  className="mt-1 text-green-600 hover:text-green-700 text-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar mensagem
                </button>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={clearGeneration}
              className="btn-secondary flex-1"
            >
              Gerar Novo
            </button>
            <button
              onClick={() => copyToClipboard(
                followUpContent.tipo === 'email' 
                  ? `${followUpContent.assunto}\n\n${followUpContent.corpo}`
                  : followUpContent.mensagem || ''
              )}
              className="btn-primary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Tudo
            </button>
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
        <h4 className="notion-caption text-amber-900 font-medium mb-1">Dicas para melhor resultado:</h4>
        <ul className="notion-caption text-amber-800 space-y-1">
          <li>• Seja específico sobre o contexto da conversa</li>
          <li>• Mencione próximos passos acordados</li>
          <li>• Inclua informações sobre interesse do lead</li>
        </ul>
      </div>
    </div>
  )
}