import { createSupabaseServiceClient } from './supabase'

export interface N8NWorkflow {
  id: string
  name: string
  description?: string
  triggerType: 'lead_status_change' | 'time_based' | 'manual'
  triggerConfig: any
  actions: N8NAction[]
  isActive: boolean
}

export interface N8NAction {
  type: 'send_email' | 'send_whatsapp' | 'create_task' | 'schedule_meeting' | 'update_lead_score'
  config: any
  delay?: number // em minutos
}

export interface WorkflowExecution {
  workflowId: string
  leadId: string
  triggerData: any
  executionId: string
}

export class N8NService {
  private supabase = createSupabaseServiceClient()
  private n8nWebhookUrl: string
  private n8nApiKey: string

  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || ''
    this.n8nApiKey = process.env.N8N_API_KEY || ''
  }

  // Criar workflow no banco
  async createWorkflow(userId: string, workflow: Omit<N8NWorkflow, 'id'>) {
    try {
      const { data, error } = await this.supabase
        .from('automation_workflows')
        .insert({
          user_id: userId,
          name: workflow.name,
          description: workflow.description,
          trigger_type: workflow.triggerType,
          trigger_config: JSON.stringify(workflow.triggerConfig),
          actions: JSON.stringify(workflow.actions),
          is_active: workflow.isActive,
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, workflow: data }
    } catch (error) {
      console.error('Erro ao criar workflow:', error)
      return { success: false, error }
    }
  }

  // Listar workflows do usuário
  async listWorkflows(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('automation_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const workflows = data.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        triggerType: row.trigger_type,
        triggerConfig: JSON.parse(row.trigger_config || '{}'),
        actions: JSON.parse(row.actions || '[]'),
        isActive: row.is_active,
        lastRunAt: row.last_run_at,
        runCount: row.run_count,
      }))

      return { success: true, workflows }
    } catch (error) {
      console.error('Erro ao listar workflows:', error)
      return { success: false, error }
    }
  }

  // Executar workflow
  async executeWorkflow(execution: WorkflowExecution) {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Log início da execução
      await this.logExecution(execution.workflowId, execution.leadId, executionId, 'running', execution.triggerData)

      // Buscar workflow
      const { data: workflowData } = await this.supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', execution.workflowId)
        .single()

      if (!workflowData || !workflowData.is_active) {
        throw new Error('Workflow não encontrado ou inativo')
      }

      const actions: N8NAction[] = JSON.parse(workflowData.actions || '[]')
      const results = []

      // Executar ações sequencialmente
      for (const action of actions) {
        if (action.delay && action.delay > 0) {
          // Em produção, usar queue/scheduler para delays
          await new Promise(resolve => setTimeout(resolve, (action.delay || 0) * 60000))
        }

        const result = await this.executeAction(action, execution.leadId, execution.triggerData)
        results.push(result)

        if (!result.success) {
          throw new Error(`Ação ${action.type} falhou: ${(result as any).error || 'Erro desconhecido'}`)
        }
      }

      // Atualizar contadores do workflow
      await this.supabase
        .from('automation_workflows')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: workflowData.run_count + 1,
        })
        .eq('id', execution.workflowId)

      // Log sucesso
      await this.logExecution(
        execution.workflowId,
        execution.leadId,
        executionId,
        'success',
        execution.triggerData,
        { results }
      )

      return { success: true, executionId, results }
    } catch (error) {
      console.error('Erro na execução do workflow:', error)
      
      // Log erro
      await this.logExecution(
        execution.workflowId,
        execution.leadId,
        executionId,
        'error',
        execution.triggerData,
        null,
        error instanceof Error ? error.message : 'Erro desconhecido'
      )

      return { success: false, error, executionId }
    }
  }

  // Executar ação individual
  private async executeAction(action: N8NAction, leadId: string, triggerData: any) {
    try {
      switch (action.type) {
        case 'send_email':
          return await this.sendEmail(action.config, leadId, triggerData)
        
        case 'send_whatsapp':
          return await this.sendWhatsApp(action.config, leadId, triggerData)
        
        case 'create_task':
          return await this.createTask(action.config, leadId, triggerData)
        
        case 'schedule_meeting':
          return await this.scheduleMeeting(action.config, leadId, triggerData)
        
        case 'update_lead_score':
          return await this.updateLeadScore(action.config, leadId)
        
        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`)
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro na ação' }
    }
  }

  // Implementações das ações
  private async sendEmail(config: any, leadId: string, triggerData: any) {
    // Buscar dados do lead
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead || !lead.email) {
      throw new Error('Lead não encontrado ou sem email')
    }

    // Substituir variáveis no template
    const subject = this.replaceVariables(config.subject, { lead, triggerData })
    const body = this.replaceVariables(config.body, { lead, triggerData })

    // Em produção, integrar com serviço de email (SendGrid, etc.)
    console.log('Enviando email:', { to: lead.email, subject, body })

    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Registrar interação
    await this.supabase
      .from('interactions')
      .insert({
        lead_id: leadId,
        type: 'email',
        content: `Email automático enviado: ${subject}`,
        ai_summary: JSON.stringify({ automated: true, subject, body }),
      })

    return { success: true, action: 'email_sent', details: { subject } }
  }

  private async sendWhatsApp(config: any, leadId: string, triggerData: any) {
    // Buscar dados do lead
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead || !lead.phone) {
      throw new Error('Lead não encontrado ou sem telefone')
    }

    const message = this.replaceVariables(config.message, { lead, triggerData })

    // Em produção, integrar com WhatsApp Business API
    console.log('Enviando WhatsApp:', { to: lead.phone, message })

    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Registrar interação
    await this.supabase
      .from('interactions')
      .insert({
        lead_id: leadId,
        type: 'whatsapp',
        content: `WhatsApp automático enviado`,
        ai_summary: JSON.stringify({ automated: true, message }),
      })

    return { success: true, action: 'whatsapp_sent', details: { message } }
  }

  private async createTask(config: any, leadId: string, triggerData: any) {
    // Buscar dados do lead para o consultor
    const { data: lead } = await this.supabase
      .from('leads')
      .select('consultant_id')
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    const title = this.replaceVariables(config.title, { lead: { id: leadId }, triggerData })
    const description = this.replaceVariables(config.description || '', { lead: { id: leadId }, triggerData })

    // Criar tarefa
    const { data: task } = await this.supabase
      .from('tasks')
      .insert({
        lead_id: leadId,
        title,
        description,
        assigned_to: lead.consultant_id,
        created_by: lead.consultant_id,
        due_date: config.dueInDays 
          ? new Date(Date.now() + config.dueInDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
        status: 'pending',
      })
      .select()
      .single()

    return { success: true, action: 'task_created', details: { taskId: task?.id, title } }
  }

  private async scheduleMeeting(config: any, leadId: string, triggerData: any) {
    // Buscar dados do lead
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    const title = this.replaceVariables(config.title, { lead, triggerData })
    const description = this.replaceVariables(config.description || '', { lead, triggerData })

    // Calcular data da reunião
    const scheduledAt = new Date(Date.now() + (config.scheduleInDays || 1) * 24 * 60 * 60 * 1000)

    // Criar reunião
    const { data: meeting } = await this.supabase
      .from('meetings')
      .insert({
        lead_id: leadId,
        title,
        scheduled_at: scheduledAt.toISOString(),
        type: config.meetingType || 'follow_up',
        status: 'scheduled',
      })
      .select()
      .single()

    return { success: true, action: 'meeting_scheduled', details: { meetingId: meeting?.id, scheduledAt } }
  }

  private async updateLeadScore(config: any, leadId: string) {
    const increment = config.scoreIncrement || 0

    if (increment !== 0) {
      await (this.supabase as any).rpc('increment_lead_score', {
        lead_id: leadId,
        increment,
      })
    }

    return { success: true, action: 'score_updated', details: { increment } }
  }

  // Substituir variáveis nos templates
  private replaceVariables(template: string, data: any): string {
    let result = template

    // Substituir variáveis do lead
    if (data.lead) {
      result = result.replace(/\{\{lead\.name\}\}/g, data.lead.name || '')
      result = result.replace(/\{\{lead\.email\}\}/g, data.lead.email || '')
      result = result.replace(/\{\{lead\.phone\}\}/g, data.lead.phone || '')
      result = result.replace(/\{\{lead\.status\}\}/g, data.lead.status || '')
    }

    // Substituir variáveis do trigger
    if (data.triggerData) {
      result = result.replace(/\{\{trigger\.oldStatus\}\}/g, data.triggerData.oldStatus || '')
      result = result.replace(/\{\{trigger\.newStatus\}\}/g, data.triggerData.newStatus || '')
    }

    // Substituir data atual
    result = result.replace(/\{\{today\}\}/g, new Date().toLocaleDateString('pt-BR'))
    result = result.replace(/\{\{now\}\}/g, new Date().toLocaleString('pt-BR'))

    return result
  }

  // Log de execução
  private async logExecution(
    workflowId: string,
    leadId: string,
    executionId: string,
    status: 'running' | 'success' | 'error',
    triggerData: any,
    executionResult?: any,
    errorMessage?: string
  ) {
    const logData: any = {
      workflow_id: workflowId,
      lead_id: leadId,
      execution_id: executionId,
      status,
      trigger_data: JSON.stringify(triggerData),
    }

    if (status === 'success' && executionResult) {
      logData.execution_result = JSON.stringify(executionResult)
      logData.completed_at = new Date().toISOString()
    }

    if (status === 'error' && errorMessage) {
      logData.error_message = errorMessage
      logData.completed_at = new Date().toISOString()
    }

    await this.supabase
      .from('automation_logs')
      .insert(logData)
  }

  // Trigger para mudança de status de lead
  static async triggerLeadStatusChange(leadId: string, oldStatus: string, newStatus: string) {
    const n8nService = new N8NService()
    const supabase = createSupabaseServiceClient()

    // Buscar workflows ativos para este trigger
    const { data: lead } = await supabase
      .from('leads')
      .select('consultant_id')
      .eq('id', leadId)
      .single()

    if (!lead) return

    const { data: workflows } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', lead.consultant_id)
      .eq('trigger_type', 'lead_status_change')
      .eq('is_active', true)

    if (!workflows) return

    // Executar workflows relevantes
    for (const workflow of workflows) {
      const triggerConfig = JSON.parse(workflow.trigger_config || '{}')
      
      // Verificar se o status mudou para o configurado
      if (triggerConfig.statusChange === newStatus || triggerConfig.statusChange === 'any') {
        await n8nService.executeWorkflow({
          workflowId: workflow.id,
          leadId,
          triggerData: { oldStatus, newStatus },
          executionId: `trigger_${Date.now()}`,
        })
      }
    }
  }
}
