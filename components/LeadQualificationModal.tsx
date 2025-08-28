'use client'

import { useState } from 'react'
import { X, CheckCircle, AlertCircle, Target, DollarSign, Calendar, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'

interface LeadQualificationModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string
  leadName: string
  currentUserId: string
  onQualificationComplete?: (qualificationData: any) => void
}

interface QualificationCriteria {
  budget: 'low' | 'medium' | 'high' | 'enterprise'
  timeline: 'immediate' | 'short' | 'medium' | 'long'
  authority: 'decision_maker' | 'influencer' | 'researcher' | 'unknown'
  need: 'urgent' | 'moderate' | 'exploring' | 'no_need'
  fit: 'perfect' | 'good' | 'fair' | 'poor'
}

const QUALIFICATION_QUESTIONS = [
  {
    id: 'budget',
    question: 'Qual o orçamento disponível para investimentos?',
    options: [
      { value: 'low', label: 'Até R$ 50.000', score: 20 },
      { value: 'medium', label: 'R$ 50.000 - R$ 500.000', score: 60 },
      { value: 'high', label: 'R$ 500.000 - R$ 2.000.000', score: 85 },
      { value: 'enterprise', label: 'Acima de R$ 2.000.000', score: 100 }
    ]
  },
  {
    id: 'timeline',
    question: 'Qual o prazo para iniciar os investimentos?',
    options: [
      { value: 'immediate', label: 'Imediatamente (até 1 mês)', score: 100 },
      { value: 'short', label: 'Curto prazo (1-3 meses)', score: 80 },
      { value: 'medium', label: 'Médio prazo (3-6 meses)', score: 50 },
      { value: 'long', label: 'Longo prazo (6+ meses)', score: 20 }
    ]
  },
  {
    id: 'authority',
    question: 'Qual o poder de decisão do contato?',
    options: [
      { value: 'decision_maker', label: 'Tomador de decisão final', score: 100 },
      { value: 'influencer', label: 'Influenciador na decisão', score: 70 },
      { value: 'researcher', label: 'Pesquisador/Analista', score: 40 },
      { value: 'unknown', label: 'Não identificado', score: 10 }
    ]
  },
  {
    id: 'need',
    question: 'Qual a urgência da necessidade?',
    options: [
      { value: 'urgent', label: 'Necessidade urgente', score: 100 },
      { value: 'moderate', label: 'Necessidade moderada', score: 70 },
      { value: 'exploring', label: 'Explorando opções', score: 40 },
      { value: 'no_need', label: 'Sem necessidade clara', score: 10 }
    ]
  },
  {
    id: 'fit',
    question: 'Como avalia o fit com nossos serviços?',
    options: [
      { value: 'perfect', label: 'Fit perfeito', score: 100 },
      { value: 'good', label: 'Bom fit', score: 75 },
      { value: 'fair', label: 'Fit razoável', score: 50 },
      { value: 'poor', label: 'Fit ruim', score: 20 }
    ]
  }
]

export function LeadQualificationModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  currentUserId,
  onQualificationComplete
}: LeadQualificationModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Partial<QualificationCriteria>>({})
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createSupabaseClient()

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Avançar para próxima pergunta automaticamente
    if (currentQuestion < QUALIFICATION_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    }
  }

  const calculateScore = () => {
    let totalScore = 0
    let answeredQuestions = 0

    QUALIFICATION_QUESTIONS.forEach(question => {
      const answer = answers[question.id as keyof QualificationCriteria]
      if (answer) {
        const option = question.options.find(opt => opt.value === answer)
        if (option) {
          totalScore += option.score
          answeredQuestions++
        }
      }
    })

    return answeredQuestions > 0 ? Math.round(totalScore / answeredQuestions) : 0
  }

  const getQualificationLevel = (score: number) => {
    if (score >= 80) return { level: 'HOT', color: 'text-red-600 bg-red-50 border-red-200' }
    if (score >= 60) return { level: 'WARM', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    if (score >= 40) return { level: 'COLD', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { level: 'UNQUALIFIED', color: 'text-gray-600 bg-gray-50 border-gray-200' }
  }

  const handleSubmit = async () => {
    const score = calculateScore()
    const qualification = getQualificationLevel(score)
    
    setIsSubmitting(true)
    
    try {
      // Atualizar score do lead
      const { error: leadError } = await (supabase as any)
        .from('leads')
        .update({
          score: score,
          notes: notes ? `${notes}\n\n--- QUALIFICAÇÃO ---\nScore: ${score} (${qualification.level})` : `Score: ${score} (${qualification.level})`,
          status: score >= 60 ? 'contato_inicial' : 'lead_qualificado',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      if (leadError) throw leadError

      // Registrar interação de qualificação
      const qualificationSummary = QUALIFICATION_QUESTIONS.map(q => {
        const answer = answers[q.id as keyof QualificationCriteria]
        const option = q.options.find(opt => opt.value === answer)
        return `${q.question}: ${option?.label || 'Não respondido'}`
      }).join('\n')

      const { error: interactionError } = await (supabase as any)
        .from('interactions')
        .insert({
          lead_id: leadId,
          type: 'note',
          content: `QUALIFICAÇÃO COMPLETA\n\nScore: ${score}/100 (${qualification.level})\n\n${qualificationSummary}\n\nObservações: ${notes || 'Nenhuma'}`,
          created_at: new Date().toISOString()
        })

      if (interactionError) throw interactionError

      // Criar tarefa baseada no score
      let taskTitle = 'Follow-up de qualificação'
      let taskDescription = `Lead qualificado com score ${score}. `
      
      if (score >= 80) {
        taskTitle = 'URGENTE: Agendar reunião com lead HOT'
        taskDescription += 'Lead com alta probabilidade de conversão. Priorizar contato imediato.'
      } else if (score >= 60) {
        taskTitle = 'Agendar reunião com lead WARM'
        taskDescription += 'Lead com potencial. Agendar reunião de discovery.'
      } else if (score >= 40) {
        taskTitle = 'Nutrir lead COLD'
        taskDescription += 'Lead com potencial futuro. Manter no pipeline de nutrição.'
      } else {
        taskTitle = 'Avaliar desqualificação'
        taskDescription += 'Lead com baixo potencial. Avaliar se deve continuar no pipeline.'
      }

      const { error: taskError } = await (supabase as any)
        .from('tasks')
        .insert({
          lead_id: leadId,
          title: taskTitle,
          description: taskDescription,
          assigned_to: currentUserId,
          created_by: currentUserId,
          status: 'pending',
          due_date: new Date(Date.now() + (score >= 80 ? 4 : score >= 60 ? 24 : 72) * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        })

      if (taskError) throw taskError

      toast.success(`Lead qualificado com score ${score}! Tarefa criada.`)
      
      if (onQualificationComplete) {
        onQualificationComplete({
          score,
          level: qualification.level,
          answers,
          notes
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar qualificação:', error)
      toast.error('Erro ao salvar qualificação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = Object.keys(answers).length === QUALIFICATION_QUESTIONS.length
  const score = calculateScore()
  const qualification = getQualificationLevel(score)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Qualificação de Lead
              </h2>
              <p className="text-sm text-gray-600">
                {leadName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso: {Object.keys(answers).length} de {QUALIFICATION_QUESTIONS.length}
            </span>
            {isComplete && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${qualification.color}`}>
                Score: {score} - {qualification.level}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / QUALIFICATION_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {!isComplete ? (
            /* Perguntas */
            <div className="space-y-6">
              {QUALIFICATION_QUESTIONS.map((question, index) => (
                <div
                  key={question.id}
                  className={`transition-all duration-300 ${
                    index === currentQuestion ? 'block' : index < currentQuestion ? 'block opacity-50' : 'hidden'
                  }`}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span>{question.question}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(question.id, option.value)}
                        disabled={index !== currentQuestion}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          answers[question.id as keyof QualificationCriteria] === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : index === currentQuestion
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-gray-200 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-gray-500">
                            Score: {option.score}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Resumo e Observações */
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${qualification.color}`}>
                  {qualification.level === 'HOT' && <AlertCircle className="w-5 h-5" />}
                  {qualification.level === 'WARM' && <Target className="w-5 h-5" />}
                  {qualification.level === 'COLD' && <User className="w-5 h-5" />}
                  {qualification.level === 'UNQUALIFIED' && <X className="w-5 h-5" />}
                  <span className="font-semibold">
                    {qualification.level} - Score {score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {QUALIFICATION_QUESTIONS.map((question) => {
                  const answer = answers[question.id as keyof QualificationCriteria]
                  const option = question.options.find(opt => opt.value === answer)
                  return (
                    <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {question.question}
                      </p>
                      <p className="text-sm text-gray-900">
                        {option?.label}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adicione observações sobre a qualificação..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {currentQuestion > 0 && !isComplete && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anterior
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            {isComplete && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Finalizar Qualificação</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
