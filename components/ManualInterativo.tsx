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
    title: '🏠 Bem-vindo ao seu CRM',
    description: 'Vamos começar! Conheça o que este sistema pode fazer por você',
    icon: Home,
    duration: '3 min',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    steps: [
      {
        id: 'intro',
        title: '👋 Olá! Você está no lugar certo',
        content: 'Este é o CRM da LDC Capital - sua central de comando para gerenciar clientes, fechar negócios e aumentar suas vendas. Aqui você vai aprender tudo o que precisa para usar o sistema como um profissional.',
        type: 'info'
      },
      {
        id: 'what-can-do',
        title: '🚀 O que você pode fazer aqui?',
        content: '• Organizar seus leads em um pipeline visual\n• Usar IA para analisar conversas\n• Importar centenas de contatos do Excel\n• Agendar reuniões automaticamente\n• Ver relatórios de performance em tempo real',
        type: 'info'
      },
      {
        id: 'how-works',
        title: '⏱️ Como funciona este tutorial?',
        content: 'Você vai passar por 8 seções rápidas. Cada uma ensina uma parte importante do sistema. Pode ir no seu ritmo - o progresso fica salvo automaticamente!',
        type: 'tip'
      }
    ]
  },
  {
    id: 'navigation',
    title: '🧭 Como navegar no sistema',
    description: 'Aprenda onde estão as coisas e como se mover rapidamente',
    icon: MousePointer,
    duration: '4 min',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    steps: [
      {
        id: 'header-tour',
        title: '📍 Barra superior - Seus atalhos principais',
        content: 'No topo da tela você tem:\n• 🏠 Logo da LDC Capital (clique para voltar ao início)\n• 🔍 Barra de busca (procure qualquer lead ou tarefa)\n• 📖 Ícone do manual (este tutorial que você está vendo)\n• 🔔 Notificações importantes\n• 👤 Seu perfil e configurações',
        type: 'action'
      },
      {
        id: 'main-areas',
        title: '🗺️ Principais áreas do sistema',
        content: 'O CRM tem 3 áreas principais:\n• **Dashboard** - Visão geral dos seus números\n• **Pipeline** - Seus leads organizados por etapa\n• **Configurações** - Ajustes do seu perfil',
        type: 'info'
      },
      {
        id: 'quick-search',
        title: '⚡ Busca rápida - Seu melhor amigo',
        content: 'Pressione **Ctrl + K** a qualquer momento para buscar:\n• Nomes de clientes\n• Empresas\n• Telefones ou emails\n• Tarefas pendentes\n\nÉ a forma mais rápida de encontrar qualquer coisa!',
        type: 'tip'
      },
      {
        id: 'keyboard-shortcuts',
        title: '⌨️ Atalhos que vão te economizar tempo',
        content: '• **Ctrl + K** = Buscar qualquer coisa\n• **Ctrl + N** = Criar novo lead\n• **Setas ← →** = Navegar neste tutorial\n• **Enter** = Marcar seção como concluída',
        type: 'tip'
      }
    ]
  },
  {
    id: 'leads',
    title: '🎯 Gerenciar seus leads (o coração do sistema)',
    description: 'Como organizar, acompanhar e converter seus prospects em clientes',
    icon: Users,
    duration: '6 min',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    steps: [
      {
        id: 'what-is-pipeline',
        title: '🔄 O que é o Pipeline?',
        content: 'O Pipeline é como um funil de vendas visual. Seus leads (possíveis clientes) passam por etapas:\n\n**1. Qualificação** → Novos contatos\n**2. Primeiro Contato** → Primeira conversa\n**3. Reunião Agendada** → Interesse confirmado\n**4. Proposta Enviada** → Negociação\n**5. Cliente** → Fechou negócio! 🎉',
        type: 'info'
      },
      {
        id: 'drag-and-drop',
        title: '🖱️ Arrastar e soltar - Simples assim!',
        content: 'Para mover um lead de uma etapa para outra:\n\n1. **Clique** no cartão do lead\n2. **Arraste** para a coluna da próxima etapa\n3. **Solte** - Pronto!\n\nO sistema salva automaticamente e atualiza a data da mudança.',
        type: 'action',
        interactive: true
      },
      {
        id: 'lead-cards',
        title: '📋 Entendendo os cartões dos leads',
        content: 'Cada cartão mostra:\n• **Nome** da pessoa/empresa\n• **Telefone** e **email** (se tiver)\n• **Origem** - como chegou até você\n• **Score** - pontuação de interesse (0-100)\n• **Data** da última atualização',
        type: 'info'
      },
      {
        id: 'lead-details',
        title: '🔍 Ver detalhes completos',
        content: '**Clique em qualquer cartão** para ver:\n• Histórico completo de conversas\n• Tarefas pendentes\n• Próximas reuniões\n• Gravações de áudio (se tiver)\n• Análises da IA\n\nÉ sua ficha completa do cliente!',
        type: 'action'
      },
      {
        id: 'add-new-lead',
        title: '➕ Como adicionar um novo lead',
        content: '**3 formas fáceis:**\n\n1. **Botão "+"** em qualquer coluna\n2. **Ctrl + N** (atalho rápido)\n3. **Importar do Excel** (vamos ver depois)\n\nPreencha nome, telefone/email e pronto!',
        type: 'action'
      }
    ]
  },
  {
    id: 'ai',
    title: '🧠 IA que trabalha para você',
    description: 'Deixe a inteligência artificial analisar suas conversas e sugerir próximos passos',
    icon: Brain,
    duration: '5 min',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    steps: [
      {
        id: 'what-is-ai',
        title: '🤖 O que a IA faz por você?',
        content: 'A IA do CRM é como ter um assistente pessoal que:\n• **Escuta** suas ligações e reuniões\n• **Transcreve** tudo que foi falado\n• **Analisa** os pontos importantes\n• **Sugere** próximas ações\n• **Identifica** oportunidades de venda',
        type: 'info'
      },
      {
        id: 'how-to-record',
        title: '🎙️ Como gravar uma conversa',
        content: '**Passo a passo:**\n\n1. Abra os detalhes de um lead\n2. Clique na aba **"Áudio"**\n3. Clique no botão **vermelho** para gravar\n4. Fale normalmente durante a ligação\n5. Clique **"Parar"** quando terminar\n\nA IA vai processar automaticamente!',
        type: 'action'
      },
      {
        id: 'ai-analysis',
        title: '📊 Entendendo a análise da IA',
        content: 'Após processar, você recebe:\n\n**📝 Transcrição completa** - Tudo que foi falado\n**🎯 Resumo** - Pontos principais em 3 linhas\n**📋 Próximas ações** - O que fazer depois\n**💰 Oportunidades** - Sinais de interesse\n**⚠️ Objeções** - Pontos de resistência',
        type: 'info'
      },
      {
        id: 'ai-suggestions',
        title: '💡 Usando as sugestões da IA',
        content: 'A IA pode sugerir:\n• **Email de follow-up** personalizado\n• **Mensagem de WhatsApp** específica\n• **Próxima reunião** com agenda\n• **Documentos** para enviar\n\nBasta clicar e usar as sugestões prontas!',
        type: 'tip'
      }
    ]
  },
  {
    id: 'import-export',
    title: '📊 Importar e exportar seus contatos',
    description: 'Traga seus contatos do Excel e leve dados para análises externas',
    icon: FileSpreadsheet,
    duration: '4 min',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    steps: [
      {
        id: 'why-import',
        title: '🚀 Por que importar contatos?',
        content: 'Se você já tem uma lista de contatos no Excel, WhatsApp ou outro lugar, não precisa digitar um por um!\n\n**Você pode importar:**\n• Planilhas do Excel (.xlsx)\n• Arquivos CSV\n• Centenas de contatos de uma vez\n• Com nome, telefone, email, empresa',
        type: 'info'
      },
      {
        id: 'how-to-import',
        title: '📥 Como importar sua planilha',
        content: '**Passo a passo:**\n\n1. No Dashboard, clique **"Importar"**\n2. **Arraste** seu arquivo Excel ou clique para selecionar\n3. **Mapeie** as colunas (Nome → Nome, Tel → Telefone)\n4. **Revise** os dados antes de importar\n5. Clique **"Importar"** - Pronto!\n\nO sistema ignora duplicatas automaticamente.',
        type: 'action'
      },
      {
        id: 'export-data',
        title: '📤 Exportar seus dados',
        content: '**Quando usar:**\n• Fazer backup dos seus leads\n• Análises no Excel\n• Relatórios para a gerência\n• Compartilhar com a equipe\n\n**Como fazer:**\nClique em **"Exportar"** → Escolha filtros → Baixe o arquivo',
        type: 'info'
      },
      {
        id: 'template-tip',
        title: '💡 Dica: Use nosso template',
        content: 'Para importar sem erro:\n\n1. Baixe nosso **template Excel**\n2. Preencha com seus contatos\n3. Importe normalmente\n\nAssim você garante que tudo vai funcionar perfeitamente!',
        type: 'tip'
      }
    ]
  },
  {
    id: 'calendar',
    title: '📅 Agendar reuniões automaticamente',
    description: 'Conecte seu Google Calendar e nunca mais perca um compromisso',
    icon: Calendar,
    duration: '3 min',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    steps: [
      {
        id: 'why-calendar',
        title: '⏰ Por que conectar o calendário?',
        content: '**Benefícios:**\n• Agendar reuniões direto do CRM\n• Sincronizar com seu Google Calendar\n• Receber lembretes automáticos\n• Não perder nenhum compromisso\n• Cliente recebe convite por email',
        type: 'info'
      },
      {
        id: 'how-to-connect',
        title: '🔗 Como conectar seu Google Calendar',
        content: '**Passo a passo:**\n\n1. Vá nos detalhes de um lead\n2. Clique na aba **"Calendário"**\n3. Clique **"Conectar Google Calendar"**\n4. Faça login na sua conta Google\n5. Autorize o acesso\n\nPronto! Agora você pode agendar direto do CRM.',
        type: 'action'
      },
      {
        id: 'schedule-meeting',
        title: '📝 Agendando uma reunião',
        content: '**Depois de conectado:**\n\n1. Escolha **data e hora**\n2. Digite o **assunto** da reunião\n3. Adicione **observações** se quiser\n4. Clique **"Agendar"**\n\nO cliente recebe o convite automaticamente!',
        type: 'action'
      }
    ]
  },
  {
    id: 'metrics',
    title: '📈 Acompanhar seus resultados',
    description: 'Números, gráficos e relatórios para melhorar sua performance',
    icon: BarChart3,
    duration: '4 min',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    steps: [
      {
        id: 'dashboard-numbers',
        title: '📊 Entendendo seu Dashboard',
        content: 'Na tela inicial você vê:\n\n**📈 Total de Leads** - Quantos prospects você tem\n**🎯 Taxa de Conversão** - % que viram clientes\n**📅 Reuniões do Mês** - Compromissos agendados\n**💰 Meta do Mês** - Seu objetivo de vendas',
        type: 'info'
      },
      {
        id: 'pipeline-analysis',
        title: '🔍 Analisando seu Pipeline',
        content: '**O que observar:**\n• Quantos leads em cada etapa\n• Onde eles "param" mais tempo\n• Quais etapas precisam de atenção\n• Seu funil está equilibrado?\n\n**Dica:** Se muitos leads param numa etapa, foque nela!',
        type: 'tip'
      },
      {
        id: 'performance-tracking',
        title: '🏆 Acompanhando sua evolução',
        content: '**Métricas importantes:**\n• **Leads/dia** - Quantos novos contatos\n• **Conversões/semana** - Quantos fecharam\n• **Tempo médio** - Quanto demora para fechar\n• **Origem dos leads** - De onde vem mais clientes\n\nUse esses números para melhorar!',
        type: 'info'
      }
    ]
  },
  {
    id: 'advanced',
    title: '⚡ Dicas para ser um ninja do CRM',
    description: 'Truques e atalhos para usar o sistema como um profissional',
    icon: Zap,
    duration: '5 min',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    steps: [
      {
        id: 'keyboard-ninja',
        title: '⌨️ Atalhos que vão te economizar horas',
        content: '**Principais atalhos:**\n• **Ctrl + K** = Buscar qualquer coisa\n• **Ctrl + N** = Novo lead rapidinho\n• **Ctrl + S** = Salvar (sempre!)\n• **Ctrl + Z** = Desfazer (salvou sua vida?)\n• **Tab** = Navegar entre campos\n• **Enter** = Confirmar ações',
        type: 'tip'
      },
      {
        id: 'daily-routine',
        title: '🌅 Rotina diária recomendada',
        content: '**Comece o dia assim:**\n\n1. **Abra o Dashboard** - Veja seus números\n2. **Confira notificações** - O que precisa fazer\n3. **Revise o Pipeline** - Mova leads que avançaram\n4. **Faça follow-ups** - Use as sugestões da IA\n5. **Agende reuniões** - Para leads quentes\n6. **Atualize informações** - Mantenha tudo em dia',
        type: 'action'
      },
      {
        id: 'pro-tips',
        title: '🎯 Dicas de profissional',
        content: '**Para ser ainda melhor:**\n\n• **Use tags** - Organize leads por categorias\n• **Grave áudios** - A IA te ajuda depois\n• **Atualize scores** - Priorize leads quentes\n• **Faça backup** - Exporte dados regularmente\n• **Teste funcionalidades** - Explore o sistema\n• **Use este manual** - Volte quando precisar!',
        type: 'tip'
      },
      {
        id: 'need-help',
        title: '🆘 Precisa de ajuda?',
        content: '**Se tiver dúvidas:**\n\n• **Revise este manual** - Tudo está aqui\n• **Use o Ctrl+K** - Busque o que precisa\n• **Fale com o administrador** - Ele pode te ajudar\n• **Experimente** - O sistema é seguro para testar\n\n**Lembre-se:** Prática leva à perfeição! 🚀',
        type: 'info'
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
              {/* Como usar este manual */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Como usar este manual</span>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Clique nas seções para aprender</p>
                  <p>• Use as setas ← → para navegar</p>
                  <p>• Marque como concluído quando terminar</p>
                  <p>• Seu progresso fica salvo automaticamente</p>
                </div>
              </div>

              {/* Modo Guiado */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Tour Automático</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Quer que eu te guie por todas as seções?
                </p>
                <button
                  onClick={() => setIsGuidedMode(!isGuidedMode)}
                  className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${
                    isGuidedMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-200'
                  }`}
                >
                  {isGuidedMode ? '⏸️ Parar Tour' : '▶️ Iniciar Tour'}
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
                                <div className="text-gray-700 leading-relaxed space-y-2">
                                  {step.content.split('\n\n').map((paragraph, idx) => (
                                    <div key={idx}>
                                      {paragraph.split('\n').map((line, lineIdx) => {
                                        // Renderizar listas com bullet points
                                        if (line.startsWith('•')) {
                                          return (
                                            <div key={lineIdx} className="flex items-start gap-2 ml-2">
                                              <span className="text-blue-500 mt-1">•</span>
                                              <span dangerouslySetInnerHTML={{ 
                                                __html: line.substring(1).trim()
                                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                              }} />
                                            </div>
                                          )
                                        }
                                        // Renderizar listas numeradas
                                        if (/^\d+\./.test(line)) {
                                          return (
                                            <div key={lineIdx} className="flex items-start gap-2 ml-2">
                                              <span className="text-blue-500 font-semibold mt-1">
                                                {line.match(/^\d+/)?.[0]}.
                                              </span>
                                              <span dangerouslySetInnerHTML={{ 
                                                __html: line.replace(/^\d+\.\s*/, '')
                                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                              }} />
                                            </div>
                                          )
                                        }
                                        // Renderizar texto normal
                                        return (
                                          <p key={lineIdx} dangerouslySetInnerHTML={{ 
                                            __html: line
                                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                          }} />
                                        )
                                      })}
                                    </div>
                                  ))}
                                </div>

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
