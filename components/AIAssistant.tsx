'use client'

import { useState } from 'react'
import { Sparkles, Mail, MessageSquare, Copy, Send, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AIAssistantProps {
  leadId: string
  userId: string
  leadName: string
}

interface FollowUpContent {
  assunto?: string
  corpo?: string
  mensagem?: string
  tipo: 'email' | 'whatsapp'
}

export function AIAssistant({ leadId, userId, leadName }: AIAssistantProps) {
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
          userId,
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
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-accent-500" />
          <span>Assistente de Follow-up IA</span>
        </h3>
      </div>

      {!followUpContent ? (
        <div className="space-y-4">
          {/* Seleção de Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Follow-up
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedType('email')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'email'
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                onClick={() => setSelectedType('whatsapp')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedType === 'whatsapp'
                    ? 'bg-accent-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Contexto */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-2">
              Contexto para o Follow-up
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
              rows={4}
              placeholder={`Ex: ${leadName} demonstrou interesse em fundos imobiliários na última conversa. Gostaria de agendar uma reunião para apresentar opções específicas...`}
            />
          </div>

          {/* Botão Gerar */}
          <button
            onClick={generateFollowUp}
            disabled={isGenerating || !context.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando follow-up...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Follow-up com IA</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Resultado Email */}
          {followUpContent.tipo === 'email' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Assunto</label>
                  <button
                    onClick={() => copyToClipboard(followUpContent.assunto || '')}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-gray-300 text-sm">
                  {followUpContent.assunto}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Corpo do Email</label>
                  <button
                    onClick={() => copyToClipboard(followUpContent.corpo || '')}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm max-h-60 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: followUpContent.corpo || '' }} />
                </div>
              </div>
            </div>
          )}

          {/* Resultado WhatsApp */}
          {followUpContent.tipo === 'whatsapp' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Mensagem WhatsApp</label>
                <button
                  onClick={() => copyToClipboard(followUpContent.mensagem || '')}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
                {followUpContent.mensagem}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={clearGeneration}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Gerar Novo
            </button>
            <button
              onClick={() => {
                const content = followUpContent.tipo === 'email' 
                  ? `${followUpContent.assunto}\n\n${followUpContent.corpo?.replace(/<[^>]*>/g, '')}`
                  : followUpContent.mensagem
                copyToClipboard(content || '')
              }}
              className="flex-1 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Tudo</span>
            </button>
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="mt-6 text-xs text-gray-500 bg-gray-900 p-3 rounded-lg">
        <p className="font-medium mb-1">💡 Dicas para melhores resultados:</p>
        <ul className="space-y-1">
          <li>• Seja específico sobre o contexto da conversa</li>
          <li>• Mencione interesses demonstrados pelo lead</li>
          <li>• Inclua próximos passos desejados</li>
          <li>• A IA usa o histórico completo do lead</li>
        </ul>
      </div>
    </div>
  )
}
