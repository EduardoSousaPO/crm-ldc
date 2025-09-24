// Sistema de Lead Scoring Inteligente para Consultoria de Investimentos
// Baseado em critérios BANT (Budget, Authority, Need, Timeline) e comportamento

interface LeadScoringData {
  // Dados demográficos
  email?: string
  phone?: string
  origin?: string
  
  // Dados comportamentais (quando disponíveis)
  patrimonio_faixa?: string
  consentimento?: boolean
  
  // Dados de interação
  interactions_count?: number
  last_interaction_days?: number
  
  // Dados de qualificação IA (quando disponível)
  qualification_data?: {
    ai_score?: number
    qualification_notes?: string
    contact_preference?: string
  }
}

interface ScoringCriteria {
  weight: number
  calculate: (data: LeadScoringData) => number
  description: string
}

// Critérios de pontuação baseados em pesquisa de mercado
const SCORING_CRITERIA: Record<string, ScoringCriteria> = {
  // Dados de Contato (25% do score)
  contact_completeness: {
    weight: 25,
    calculate: (data) => {
      let score = 0
      if (data.email) score += 40
      if (data.phone) score += 40
      if (data.email && data.phone) score += 20 // Bonus por ter ambos
      return Math.min(score, 100)
    },
    description: 'Completude das informações de contato'
  },

  // Fonte/Origem (20% do score)
  lead_source_quality: {
    weight: 20,
    calculate: (data) => {
      if (!data.origin) return 50
      
      const sourceScores: Record<string, number> = {
        'indicacao': 100,
        'linkedin': 90,
        'google ads': 85,
        'site': 80,
        'facebook': 75,
        'instagram': 70,
        'whatsapp': 85,
        'evento': 95,
        'webinar': 90,
        'cold_call': 40,
        'lista_comprada': 30
      }
      
      const origin = data.origin.toLowerCase()
      for (const [key, score] of Object.entries(sourceScores)) {
        if (origin.includes(key)) return score
      }
      
      return 60 // Score padrão para origens não mapeadas
    },
    description: 'Qualidade da fonte de origem do lead'
  },

  // Patrimônio/Budget (30% do score)
  financial_capacity: {
    weight: 30,
    calculate: (data) => {
      if (!data.patrimonio_faixa) return 50 // Score neutro se não informado
      
      const patrimonioScores: Record<string, number> = {
        'ate_50k': 40,
        '50k_200k': 60,
        '200k_500k': 75,
        '500k_1m': 85,
        '1m_5m': 95,
        'acima_5m': 100,
        'nao_informado': 50
      }
      
      return patrimonioScores[data.patrimonio_faixa] || 50
    },
    description: 'Capacidade financeira estimada'
  },

  // Engajamento/Interesse (15% do score)
  engagement_level: {
    weight: 15,
    calculate: (data) => {
      let score = 50 // Score base
      
      // Consentimento para contato
      if (data.consentimento) score += 30
      
      // Número de interações
      if (data.interactions_count) {
        score += Math.min(data.interactions_count * 10, 30)
      }
      
      // Recência da última interação
      if (data.last_interaction_days !== undefined) {
        if (data.last_interaction_days <= 1) score += 20
        else if (data.last_interaction_days <= 7) score += 10
        else if (data.last_interaction_days <= 30) score += 5
        else score -= 10
      }
      
      return Math.min(Math.max(score, 0), 100)
    },
    description: 'Nível de engajamento e interesse demonstrado'
  },

  // Score da IA (10% do score) - quando disponível
  ai_qualification: {
    weight: 10,
    calculate: (data) => {
      if (data.qualification_data?.ai_score) {
        return data.qualification_data.ai_score
      }
      return 50 // Score neutro se não há qualificação IA
    },
    description: 'Pontuação da qualificação por IA'
  }
}

export function calculateLeadScore(data: LeadScoringData): {
  totalScore: number
  breakdown: Record<string, { score: number; weight: number; weightedScore: number }>
  recommendation: string
  priority: 'alta' | 'média' | 'baixa'
} {
  let totalWeightedScore = 0
  const breakdown: Record<string, { score: number; weight: number; weightedScore: number }> = {}
  
  // Calcular score para cada critério
  for (const [criteriaName, criteria] of Object.entries(SCORING_CRITERIA)) {
    const score = criteria.calculate(data)
    const weightedScore = (score * criteria.weight) / 100
    
    breakdown[criteriaName] = {
      score,
      weight: criteria.weight,
      weightedScore
    }
    
    totalWeightedScore += weightedScore
  }
  
  const totalScore = Math.round(totalWeightedScore)
  
  // Determinar prioridade e recomendação
  let priority: 'alta' | 'média' | 'baixa'
  let recommendation: string
  
  if (totalScore >= 80) {
    priority = 'alta'
    recommendation = 'Lead premium - Contactar imediatamente. Alta probabilidade de conversão.'
  } else if (totalScore >= 60) {
    priority = 'média'
    recommendation = 'Lead qualificado - Agendar contato em até 4 horas. Boa probabilidade de conversão.'
  } else if (totalScore >= 40) {
    priority = 'baixa'
    recommendation = 'Lead para nutrição - Incluir em campanha de educação. Contactar em 24-48h.'
  } else {
    priority = 'baixa'
    recommendation = 'Lead de baixa qualidade - Verificar dados e considerar descarte ou nutrição de longo prazo.'
  }
  
  return {
    totalScore,
    breakdown,
    recommendation,
    priority
  }
}

// Função para recalcular score quando dados do lead são atualizados
export function updateLeadScore(leadData: any): number {
  const scoringData: LeadScoringData = {
    email: leadData.email,
    phone: leadData.phone,
    origin: leadData.origin,
    patrimonio_faixa: leadData.patrimonio_faixa,
    consentimento: leadData.consentimento,
    // Aqui você pode adicionar lógica para buscar dados de interação do banco
    interactions_count: 0, // TODO: buscar do banco
    last_interaction_days: undefined, // TODO: calcular baseado na última interação
  }
  
  const result = calculateLeadScore(scoringData)
  return result.totalScore
}

// Função para gerar insights baseados no score
export function generateLeadInsights(scoringResult: ReturnType<typeof calculateLeadScore>): string[] {
  const insights: string[] = []
  const { breakdown, totalScore } = scoringResult
  
  // Insights baseados nos critérios
  if (breakdown.contact_completeness.score < 70) {
    insights.push('Faltam informações de contato - solicitar telefone ou email adicional')
  }
  
  if (breakdown.lead_source_quality.score >= 90) {
    insights.push('Fonte de alta qualidade - lead tem maior propensão à conversão')
  }
  
  if (breakdown.financial_capacity.score < 60) {
    insights.push('Capacidade financeira não confirmada - qualificar orçamento na primeira ligação')
  }
  
  if (breakdown.engagement_level.score < 50) {
    insights.push('Baixo engajamento - considerar estratégia de nutrição antes do contato direto')
  }
  
  if (breakdown.ai_qualification.score >= 80) {
    insights.push('IA identificou alta qualificação - priorizar contato imediato')
  }
  
  // Insights gerais baseados no score total
  if (totalScore >= 85) {
    insights.push('Lead premium - agendar reunião de descoberta imediatamente')
  } else if (totalScore <= 35) {
    insights.push('Lead de baixa qualidade - considerar descarte ou nutrição de longo prazo')
  }
  
  return insights
}

// Constantes para categorização de leads
export const LEAD_CATEGORIES = {
  HOT: { min: 80, max: 100, label: 'Hot Lead', color: 'red' },
  WARM: { min: 60, max: 79, label: 'Warm Lead', color: 'yellow' },
  COLD: { min: 40, max: 59, label: 'Cold Lead', color: 'blue' },
  UNQUALIFIED: { min: 0, max: 39, label: 'Unqualified', color: 'gray' }
}

export function getLeadCategory(score: number) {
  for (const [key, category] of Object.entries(LEAD_CATEGORIES)) {
    if (score >= category.min && score <= category.max) {
      return { key, ...category }
    }
  }
  return { key: 'UNQUALIFIED', ...LEAD_CATEGORIES.UNQUALIFIED }
}

