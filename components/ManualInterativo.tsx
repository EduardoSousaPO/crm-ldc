'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Play,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Users,
  Brain,
  FileSpreadsheet,
  Calendar,
  BarChart3,
  Zap,
  Search,
  Bookmark,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  MousePointer,
  Lightbulb,
  Award
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ManualSection {
  id: string
  title: string
  description: string
  icon: any
  duration: string
  steps: ManualStep[]
  color: string
  bgColor: string
}

interface ManualStep {
  id: string
  title: string
  content: string
  type: 'info' | 'action' | 'tip' | 'warning'
  interactive?: boolean
  demoUrl?: string
}

const manualSections: ManualSection[] = [
  {
    id: 'welcome',
    title: 'Boas-vindas ao CRM',
    description: 'Introdução e visão geral da plataforma',
    icon: Home,
    duration: '2 min',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    steps: [
      {
        id: 'intro',
        title: 'Bem-vindo à LDC Capital',
        content: 'Este CRM foi desenvolvido especialmente para consultores de investimento, com IA integrada e automações inteligentes.',
        type: 'info'
      },
      {
        id: 'overview',
        title: 'Visão Geral das Funcionalidades',
        content: 'Dashboard inteligente, pipeline visual, IA para análise, importação automática e muito mais.',
        type: 'info'
      }
    ]
  },
  {
    id: 'navigation',
    title: 'Navegação Básica',
    description: 'Como navegar pela interface do CRM',
    icon: MousePointer,
    duration: '3 min',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    steps: [
      {
        id: 'menu',
        title: 'Menu Principal',
        content: 'Acesse todas as funcionalidades através do menu lateral. Dashboard, Pipeline, Configurações e este Manual.',
        type: 'action',
        interactive: true
      },
      {
        id: 'search',
        title: 'Busca Inteligente',
        content: 'Use Ctrl+K para busca rápida em leads, tarefas e contatos.',
        type: 'tip'
      }
    ]
  },
  {
    id: 'leads',
    title: 'Gestão de Leads',
    description: 'Pipeline Kanban e gestão completa de prospects',
    icon: Users,
    duration: '5 min',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    steps: [
      {
        id: 'kanban',
        title: 'Pipeline Kanban',
        content: 'Arraste e solte leads entre as etapas. Cada coluna representa uma fase do processo comercial.',
        type: 'action',
        interactive: true
      },
      {
        id: 'lead-details',
        title: 'Detalhes do Lead',
        content: 'Clique em qualquer lead para ver informações completas, histórico e próximas ações.',
        type: 'info'
      }
    ]
  },
  {
    id: 'ai',
    title: 'IA Assistant',
    description: 'Transcrição e análise inteligente de conversas',
    icon: Brain,
    duration: '4 min',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    steps: [
      {
        id: 'recording',
        title: 'Gravação de Áudio',
        content: 'Grave ligações e reuniões diretamente no CRM. A IA transcreverá automaticamente.',
        type: 'action'
      },
      {
        id: 'analysis',
        title: 'Análise Inteligente',
        content: 'A IA extrai insights, próximas ações e pontos importantes das suas conversas.',
        type: 'info'
      }
    ]
  },
  {
    id: 'import-export',
    title: 'Importação/Exportação',
    description: 'Gestão de dados em Excel e CSV',
    icon: FileSpreadsheet,
    duration: '3 min',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    steps: [
      {
        id: 'import',
        title: 'Importar Leads',
        content: 'Arraste arquivos Excel/CSV ou use nosso template para importação em massa.',
        type: 'action'
      },
      {
        id: 'export',
        title: 'Exportar Dados',
        content: 'Exporte leads com filtros personalizados para análises externas.',
        type: 'info'
      }
    ]
  },
  {
    id: 'calendar',
    title: 'Calendário Integrado',
    description: 'Sincronização com Google Calendar',
    icon: Calendar,
    duration: '2 min',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    steps: [
      {
        id: 'sync',
        title: 'Sincronização',
        content: 'Conecte seu Google Calendar para agendar reuniões diretamente do CRM.',
        type: 'action'
      }
    ]
  },
  {
    id: 'metrics',
    title: 'Métricas e KPIs',
    description: 'Dashboard analítico e relatórios',
    icon: BarChart3,
    duration: '3 min',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    steps: [
      {
        id: 'dashboard',
        title: 'Dashboard Analítico',
        content: 'Acompanhe conversões, pipeline e performance em tempo real.',
        type: 'info'
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Dicas Avançadas',
    description: 'Shortcuts e produtividade máxima',
    icon: Zap,
    duration: '4 min',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    steps: [
      {
        id: 'shortcuts',
        title: 'Atalhos de Teclado',
        content: 'Ctrl+K (busca), Ctrl+N (novo lead), Ctrl+S (salvar). Seja mais produtivo!',
        type: 'tip'
      }
    ]
  }
]

interface ManualInterativoProps {
  onClose?: () => void
  currentUserId?: string
  userRole?: 'admin' | 'consultor'
}

export function ManualInterativo({ onClose, currentUserId, userRole = 'consultor' }: ManualInterativoProps) {
  const [currentSection, setCurrentSection] = useState<string>('welcome')
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isGuidedMode, setIsGuidedMode] = useState(false)
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState(false)

  const currentSectionData = manualSections.find(s => s.id === currentSection)
  const totalSections = manualSections.length
  const completedCount = completedSections.length
  const progressPercentage = (completedCount / totalSections) * 100

  // Filtrar seções baseado na busca
  const filteredSections = manualSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Marcar seção como completa
  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId])
      toast.success('Seção concluída! 🎉')
    }
  }

  // Navegar para próxima seção
  const goToNextSection = () => {
    const currentIndex = manualSections.findIndex(s => s.id === currentSection)
    if (currentIndex < manualSections.length - 1) {
      markSectionComplete(currentSection)
      setCurrentSection(manualSections[currentIndex + 1].id)
      setCurrentStep(0)
    }
  }

  // Navegar para seção anterior
  const goToPreviousSection = () => {
    const currentIndex = manualSections.findIndex(s => s.id === currentSection)
    if (currentIndex > 0) {
      setCurrentSection(manualSections[currentIndex - 1].id)
      setCurrentStep(0)
    }
  }

  // Toggle bookmark
  const toggleBookmark = (sectionId: string) => {
    if (bookmarkedSections.includes(sectionId)) {
      setBookmarkedSections(bookmarkedSections.filter(id => id !== sectionId))
    } else {
      setBookmarkedSections([...bookmarkedSections, sectionId])
    }
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setShowSearch(!showSearch)
      }
      if (e.key === 'ArrowRight' && !showSearch) {
        goToNextSection()
      }
      if (e.key === 'ArrowLeft' && !showSearch) {
        goToPreviousSection()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSection, showSearch])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Manual Interativo</h1>
                <p className="text-sm text-gray-500">CRM LDC Capital</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {completedCount}/{totalSections}
                </span>
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Close */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar no manual... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Índice */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Modo Guiado */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Modo Guiado</span>
                </div>
                <button
                  onClick={() => setIsGuidedMode(!isGuidedMode)}
                  className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${
                    isGuidedMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-200'
                  }`}
                >
                  {isGuidedMode ? 'Desativar' : 'Ativar'} Tour Guiado
                </button>
              </div>

              {/* Índice de Seções */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 mb-3">Conteúdo</h3>
                {(searchQuery ? filteredSections : manualSections).map((section) => {
                  const Icon = section.icon
                  const isActive = section.id === currentSection
                  const isCompleted = completedSections.includes(section.id)
                  const isBookmarked = bookmarkedSections.includes(section.id)

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => {
                        setCurrentSection(section.id)
                        setCurrentStep(0)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md ${section.bgColor}`}>
                          <Icon className={`w-4 h-4 ${section.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {section.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              {isBookmarked && (
                                <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                              {isCompleted && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {section.duration}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Bookmarks */}
              {bookmarkedSections.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-yellow-500" />
                    Favoritos
                  </h3>
                  <div className="space-y-1">
                    {bookmarkedSections.map(sectionId => {
                      const section = manualSections.find(s => s.id === sectionId)
                      if (!section) return null
                      
                      return (
                        <button
                          key={sectionId}
                          onClick={() => setCurrentSection(sectionId)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {section.title}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentSectionData && (
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  {/* Header da Seção */}
                  <div className={`p-6 ${currentSectionData.bgColor} border-b border-gray-100`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <currentSectionData.icon className={`w-6 h-6 ${currentSectionData.color}`} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {currentSectionData.title}
                          </h2>
                          <p className="text-gray-600 mb-3">
                            {currentSectionData.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Play className="w-4 h-4" />
                              {currentSectionData.duration}
                            </span>
                            <span>{currentSectionData.steps.length} passos</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(currentSection)}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Bookmark 
                          className={`w-5 h-5 ${
                            bookmarkedSections.includes(currentSection) 
                              ? 'text-yellow-500 fill-current' 
                              : ''
                          }`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo dos Passos */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {currentSectionData.steps.map((step, index) => {
                        const isCurrentStep = index === currentStep
                        const isCompletedStep = index < currentStep

                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0.5 }}
                            animate={{ 
                              opacity: isCurrentStep || isCompletedStep ? 1 : 0.5,
                              scale: isCurrentStep ? 1 : 0.98
                            }}
                            className={`p-4 rounded-lg border transition-all ${
                              isCurrentStep
                                ? 'bg-blue-50 border-blue-200'
                                : isCompletedStep
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-full ${
                                isCompletedStep
                                  ? 'bg-green-500'
                                  : isCurrentStep
                                  ? 'bg-blue-500'
                                  : 'bg-gray-300'
                              }`}>
                                {isCompletedStep ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="w-4 h-4 flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                  {step.title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                  {step.content}
                                </p>

                                {step.type === 'tip' && (
                                  <div className="mt-3 flex items-center gap-2 text-amber-600">
                                    <Lightbulb className="w-4 h-4" />
                                    <span className="text-sm font-medium">Dica</span>
                                  </div>
                                )}

                                {step.interactive && isCurrentStep && (
                                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">
                                      🎯 Experimente agora:
                                    </p>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                                      Testar Funcionalidade
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Navegação */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={goToPreviousSection}
                        disabled={manualSections.findIndex(s => s.id === currentSection) === 0}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Anterior
                      </button>

                      <div className="flex items-center gap-3">
                        {!completedSections.includes(currentSection) && (
                          <button
                            onClick={() => markSectionComplete(currentSection)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marcar como Concluída
                          </button>
                        )}

                        <button
                          onClick={goToNextSection}
                          disabled={manualSections.findIndex(s => s.id === currentSection) === manualSections.length - 1}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Próximo
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Congratulations */}
            {completedCount === totalSections && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
              >
                <div className="text-center">
                  <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🎉 Parabéns! Você dominou o CRM!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você completou todas as seções do manual. Agora você é um power user da LDC Capital!
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Começar a Usar o CRM
                    </button>
                    <button 
                      onClick={() => setCompletedSections([])}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Revisar Manual
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
