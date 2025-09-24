export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      automation_logs: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          execution_result: string | null
          id: string
          lead_id: string | null
          started_at: string | null
          status: string
          trigger_data: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          execution_result?: string | null
          id?: string
          lead_id?: string | null
          started_at?: string | null
          status: string
          trigger_data?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          execution_result?: string | null
          id?: string
          lead_id?: string | null
          started_at?: string | null
          status?: string
          trigger_data?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          run_count: number | null
          trigger_config: string | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          run_count?: number | null
          trigger_config?: string | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          run_count?: number | null
          trigger_config?: string | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          autor: string
          conteudo: string
          created_at: string | null
          id: string
          imagem_capa: string | null
          publicado: boolean | null
          resumo: string | null
          slug: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          autor: string
          conteudo: string
          created_at?: string | null
          id?: string
          imagem_capa?: string | null
          publicado?: boolean | null
          resumo?: string | null
          slug: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          autor?: string
          conteudo?: string
          created_at?: string | null
          id?: string
          imagem_capa?: string | null
          publicado?: boolean | null
          resumo?: string | null
          slug?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          lead_id: string | null
          meeting_id: string | null
          meeting_url: string | null
          start_time: string
          status: string | null
          sync_status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          start_time: string
          status?: string | null
          sync_status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_id?: string | null
          meeting_url?: string | null
          start_time?: string
          status?: string | null
          sync_status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_attempts: {
        Row: {
          attempt_type: string
          completed_date: string | null
          contact_method: Database["public"]["Enums"]["contact_method"]
          created_at: string | null
          duration_minutes: number | null
          id: string
          lead_id: string
          next_action: string | null
          next_contact_date: string | null
          notes: string | null
          outcome_summary: string | null
          priority: Database["public"]["Enums"]["follow_up_priority"] | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["contact_status"]
          template_used: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_type?: string
          completed_date?: string | null
          contact_method: Database["public"]["Enums"]["contact_method"]
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id: string
          next_action?: string | null
          next_contact_date?: string | null
          notes?: string | null
          outcome_summary?: string | null
          priority?: Database["public"]["Enums"]["follow_up_priority"] | null
          scheduled_date?: string | null
          status: Database["public"]["Enums"]["contact_status"]
          template_used?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_type?: string
          completed_date?: string | null
          contact_method?: Database["public"]["Enums"]["contact_method"]
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string
          next_action?: string | null
          next_contact_date?: string | null
          notes?: string | null
          outcome_summary?: string | null
          priority?: Database["public"]["Enums"]["follow_up_priority"] | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          template_used?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_attempts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_templates: {
        Row: {
          contact_method: Database["public"]["Enums"]["contact_method"]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          suggested_timing_days: number | null
          template_content: string
          updated_at: string | null
        }
        Insert: {
          contact_method: Database["public"]["Enums"]["contact_method"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          suggested_timing_days?: number | null
          template_content: string
          updated_at?: string | null
        }
        Update: {
          contact_method?: Database["public"]["Enums"]["contact_method"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          suggested_timing_days?: number | null
          template_content?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          ai_summary: string | null
          audio_url: string | null
          content: string | null
          created_at: string | null
          id: string
          lead_id: string
          transcription: string | null
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Insert: {
          ai_summary?: string | null
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          transcription?: string | null
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Update: {
          ai_summary?: string | null
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          transcription?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          best_contact_time: string | null
          consentimento: boolean | null
          consultant_id: string
          contact_preference:
            | Database["public"]["Enums"]["contact_method"]
            | null
          created_at: string | null
          email: string | null
          id: string
          last_contact_attempt: string | null
          name: string
          next_follow_up_date: string | null
          notes: string | null
          origin: string | null
          patrimonio_faixa: string | null
          phone: string | null
          score: number | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          best_contact_time?: string | null
          consentimento?: boolean | null
          consultant_id: string
          contact_preference?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_attempt?: string | null
          name: string
          next_follow_up_date?: string | null
          notes?: string | null
          origin?: string | null
          patrimonio_faixa?: string | null
          phone?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          best_contact_time?: string | null
          consentimento?: boolean | null
          consultant_id?: string
          contact_preference?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_attempt?: string | null
          name?: string
          next_follow_up_date?: string | null
          notes?: string | null
          origin?: string | null
          patrimonio_faixa?: string | null
          phone?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          arquivo_url: string
          categoria: string
          created_at: string | null
          descricao: string | null
          id: string
          requer_cadastro: boolean | null
          tipo: string
          titulo: string
        }
        Insert: {
          arquivo_url: string
          categoria: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          requer_cadastro?: boolean | null
          tipo: string
          titulo: string
        }
        Update: {
          arquivo_url?: string
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          requer_cadastro?: boolean | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          id: string
          lead_id: string
          meeting_url: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          transcription: string | null
          type: Database["public"]["Enums"]["meeting_type"] | null
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          meeting_url?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          transcription?: string | null
          type?: Database["public"]["Enums"]["meeting_type"] | null
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          meeting_url?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string
          transcription?: string | null
          type?: Database["public"]["Enums"]["meeting_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          created_at: string | null
          google_tokens: string | null
          id: string
          is_active: boolean | null
          provider: string
          teams_config: string | null
          updated_at: string | null
          user_id: string
          whatsapp_config: string | null
          zoom_config: string | null
        }
        Insert: {
          created_at?: string | null
          google_tokens?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          teams_config?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_config?: string | null
          zoom_config?: string | null
        }
        Update: {
          created_at?: string | null
          google_tokens?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          teams_config?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_config?: string | null
          zoom_config?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_lead_score: {
        Args: { increment: number; lead_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      contact_method:
        | "phone"
        | "email"
        | "whatsapp"
        | "linkedin"
        | "in_person"
        | "video_call"
        | "sms"
      contact_status:
        | "not_answered"
        | "requested_callback"
        | "meeting_scheduled"
        | "not_interested"
        | "converted"
        | "invalid_contact"
        | "busy_try_later"
        | "voicemail_left"
        | "email_sent"
        | "follow_up_scheduled"
      follow_up_priority: "low" | "medium" | "high" | "urgent"
      interaction_type:
        | "audio"
        | "note"
        | "meeting"
        | "call"
        | "email"
        | "whatsapp"
      lead_status:
        | "lead_qualificado"
        | "contato_inicial"
        | "reuniao_agendada"
        | "discovery_concluido"
        | "proposta_apresentada"
        | "em_negociacao"
        | "cliente_ativo"
      meeting_status: "scheduled" | "completed" | "cancelled" | "no_show"
      meeting_type: "r1_discovery" | "r2_proposta" | "follow_up" | "onboarding"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_method: [
        "phone",
        "email",
        "whatsapp",
        "linkedin",
        "in_person",
        "video_call",
        "sms",
      ],
      contact_status: [
        "not_answered",
        "requested_callback",
        "meeting_scheduled",
        "not_interested",
        "converted",
        "invalid_contact",
        "busy_try_later",
        "voicemail_left",
        "email_sent",
        "follow_up_scheduled",
      ],
      follow_up_priority: ["low", "medium", "high", "urgent"],
      interaction_type: [
        "audio",
        "note",
        "meeting",
        "call",
        "email",
        "whatsapp",
      ],
      lead_status: [
        "lead_qualificado",
        "contato_inicial",
        "reuniao_agendada",
        "discovery_concluido",
        "proposta_apresentada",
        "em_negociacao",
        "cliente_ativo",
      ],
      meeting_status: ["scheduled", "completed", "cancelled", "no_show"],
      meeting_type: ["r1_discovery", "r2_proposta", "follow_up", "onboarding"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const

// Convenience type aliases
export type Lead = Tables<'leads'>
export type ContactAttempt = Tables<'contact_attempts'>
export type FollowUpTemplate = Tables<'follow_up_templates'>
export type User = Tables<'users'>
export type ContactMethod = Enums<'contact_method'>
export type ContactStatus = Enums<'contact_status'>
export type FollowUpPriority = Enums<'follow_up_priority'>
export type LeadStatus = Enums<'lead_status'>