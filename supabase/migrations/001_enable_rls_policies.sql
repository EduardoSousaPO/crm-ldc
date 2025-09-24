-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- CRM LDC CAPITAL
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é consultor
CREATE OR REPLACE FUNCTION is_consultor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'consultor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o role do usuário atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA TABELA USERS
-- =====================================================

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Consultores podem ver apenas seu próprio perfil
CREATE POLICY "Consultors can view own profile" ON users
  FOR SELECT USING (auth.uid() = id AND is_consultor());

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Apenas usuários autenticados podem inserir (para registro)
CREATE POLICY "Authenticated users can insert profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Apenas admins podem deletar usuários
CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA LEADS
-- =====================================================

-- Admins podem ver todos os leads
CREATE POLICY "Admins can view all leads" ON leads
  FOR SELECT USING (is_admin());

-- Consultores podem ver apenas seus próprios leads
CREATE POLICY "Consultors can view own leads" ON leads
  FOR SELECT USING (consultant_id = auth.uid() AND is_consultor());

-- Admins podem inserir leads para qualquer consultor
CREATE POLICY "Admins can insert any lead" ON leads
  FOR INSERT WITH CHECK (is_admin());

-- Consultores podem inserir leads apenas para si mesmos
CREATE POLICY "Consultors can insert own leads" ON leads
  FOR INSERT WITH CHECK (consultant_id = auth.uid() AND is_consultor());

-- Admins podem atualizar qualquer lead
CREATE POLICY "Admins can update any lead" ON leads
  FOR UPDATE USING (is_admin());

-- Consultores podem atualizar apenas seus próprios leads
CREATE POLICY "Consultors can update own leads" ON leads
  FOR UPDATE USING (consultant_id = auth.uid() AND is_consultor());

-- Apenas admins podem deletar leads
CREATE POLICY "Only admins can delete leads" ON leads
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA INTERACTIONS
-- =====================================================

-- Admins podem ver todas as interações
CREATE POLICY "Admins can view all interactions" ON interactions
  FOR SELECT USING (is_admin());

-- Consultores podem ver interações de seus próprios leads
CREATE POLICY "Consultors can view own lead interactions" ON interactions
  FOR SELECT USING (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = interactions.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Admins podem inserir interações em qualquer lead
CREATE POLICY "Admins can insert any interaction" ON interactions
  FOR INSERT WITH CHECK (is_admin());

-- Consultores podem inserir interações apenas em seus próprios leads
CREATE POLICY "Consultors can insert own lead interactions" ON interactions
  FOR INSERT WITH CHECK (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = interactions.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Admins podem atualizar qualquer interação
CREATE POLICY "Admins can update any interaction" ON interactions
  FOR UPDATE USING (is_admin());

-- Consultores podem atualizar interações de seus próprios leads
CREATE POLICY "Consultors can update own lead interactions" ON interactions
  FOR UPDATE USING (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = interactions.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Apenas admins podem deletar interações
CREATE POLICY "Only admins can delete interactions" ON interactions
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA TASKS
-- =====================================================

-- Admins podem ver todas as tarefas
CREATE POLICY "Admins can view all tasks" ON tasks
  FOR SELECT USING (is_admin());

-- Consultores podem ver tarefas atribuídas a eles ou de seus leads
CREATE POLICY "Consultors can view assigned or own lead tasks" ON tasks
  FOR SELECT USING (
    is_consultor() AND (
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = tasks.lead_id 
        AND leads.consultant_id = auth.uid()
      )
    )
  );

-- Admins podem inserir qualquer tarefa
CREATE POLICY "Admins can insert any task" ON tasks
  FOR INSERT WITH CHECK (is_admin());

-- Consultores podem inserir tarefas em seus próprios leads
CREATE POLICY "Consultors can insert own lead tasks" ON tasks
  FOR INSERT WITH CHECK (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = tasks.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Admins podem atualizar qualquer tarefa
CREATE POLICY "Admins can update any task" ON tasks
  FOR UPDATE USING (is_admin());

-- Consultores podem atualizar tarefas atribuídas a eles
CREATE POLICY "Consultors can update assigned tasks" ON tasks
  FOR UPDATE USING (assigned_to = auth.uid() AND is_consultor());

-- Apenas admins podem deletar tarefas
CREATE POLICY "Only admins can delete tasks" ON tasks
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA MEETINGS
-- =====================================================

-- Admins podem ver todas as reuniões
CREATE POLICY "Admins can view all meetings" ON meetings
  FOR SELECT USING (is_admin());

-- Consultores podem ver reuniões de seus próprios leads
CREATE POLICY "Consultors can view own lead meetings" ON meetings
  FOR SELECT USING (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = meetings.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Admins podem inserir reuniões para qualquer lead
CREATE POLICY "Admins can insert any meeting" ON meetings
  FOR INSERT WITH CHECK (is_admin());

-- Consultores podem inserir reuniões apenas em seus próprios leads
CREATE POLICY "Consultors can insert own lead meetings" ON meetings
  FOR INSERT WITH CHECK (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = meetings.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Admins podem atualizar qualquer reunião
CREATE POLICY "Admins can update any meeting" ON meetings
  FOR UPDATE USING (is_admin());

-- Consultores podem atualizar reuniões de seus próprios leads
CREATE POLICY "Consultors can update own lead meetings" ON meetings
  FOR UPDATE USING (
    is_consultor() AND EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = meetings.lead_id 
      AND leads.consultant_id = auth.uid()
    )
  );

-- Apenas admins podem deletar reuniões
CREATE POLICY "Only admins can delete meetings" ON meetings
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA CALENDAR_EVENTS
-- =====================================================

-- Usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem inserir apenas seus próprios eventos
CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar apenas seus próprios eventos
CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar apenas seus próprios eventos
CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA TABELA USER_INTEGRATIONS
-- =====================================================

-- Usuários podem ver apenas suas próprias integrações
CREATE POLICY "Users can view own integrations" ON user_integrations
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem inserir apenas suas próprias integrações
CREATE POLICY "Users can insert own integrations" ON user_integrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar apenas suas próprias integrações
CREATE POLICY "Users can update own integrations" ON user_integrations
  FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar apenas suas próprias integrações
CREATE POLICY "Users can delete own integrations" ON user_integrations
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA TABELA AUTOMATION_WORKFLOWS
-- =====================================================

-- Apenas admins podem ver todos os workflows
CREATE POLICY "Only admins can view workflows" ON automation_workflows
  FOR SELECT USING (is_admin());

-- Apenas admins podem inserir workflows
CREATE POLICY "Only admins can insert workflows" ON automation_workflows
  FOR INSERT WITH CHECK (is_admin());

-- Apenas admins podem atualizar workflows
CREATE POLICY "Only admins can update workflows" ON automation_workflows
  FOR UPDATE USING (is_admin());

-- Apenas admins podem deletar workflows
CREATE POLICY "Only admins can delete workflows" ON automation_workflows
  FOR DELETE USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TABELA AUTOMATION_LOGS
-- =====================================================

-- Apenas admins podem ver logs de automação
CREATE POLICY "Only admins can view automation logs" ON automation_logs
  FOR SELECT USING (is_admin());

-- Sistema pode inserir logs (via service role)
-- Não criamos política de INSERT pois será feita via service role

-- Apenas admins podem deletar logs antigos
CREATE POLICY "Only admins can delete old logs" ON automation_logs
  FOR DELETE USING (is_admin());

-- =====================================================
-- GRANTS PARA FUNÇÕES AUXILIARES
-- =====================================================

-- Permitir que usuários autenticados usem as funções auxiliares
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_consultor() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual tem papel de administrador';
COMMENT ON FUNCTION is_consultor() IS 'Verifica se o usuário atual tem papel de consultor';
COMMENT ON FUNCTION get_user_role() IS 'Retorna o papel do usuário atual';

-- =====================================================
-- TRIGGER PARA AUTO-ATUALIZAR updated_at
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA INCREMENTAR SCORE DO LEAD
-- =====================================================

CREATE OR REPLACE FUNCTION increment_lead_score(lead_id UUID, increment INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE leads 
  SET score = COALESCE(score, 0) + increment,
      updated_at = NOW()
  WHERE id = lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir uso da função
GRANT EXECUTE ON FUNCTION increment_lead_score(UUID, INTEGER) TO authenticated;



