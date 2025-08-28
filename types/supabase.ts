export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          id: string
          user_id: string
          provider: string
          google_tokens: string | null
          whatsapp_config: string | null
          zoom_config: string | null
          teams_config: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          google_tokens?: string | null
          whatsapp_config?: string | null
          zoom_config?: string | null
          teams_config?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          google_tokens?: string | null
          whatsapp_config?: string | null
          zoom_config?: string | null
          teams_config?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          lead_id: string | null
          meeting_id: string | null
          user_id: string
          google_event_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          attendees: string[]
          meeting_url: string | null
          status: string
          sync_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          meeting_id?: string | null
          user_id: string
          google_event_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          attendees?: string[]
          meeting_url?: string | null
          status?: string
          sync_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          meeting_id?: string | null
          user_id?: string
          google_event_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          attendees?: string[]
          meeting_url?: string | null
          status?: string
          sync_status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      automation_workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          trigger_type: string
          trigger_config: string | null
          actions: string
          is_active: boolean
          last_run_at: string | null
          run_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          trigger_type: string
          trigger_config?: string | null
          actions: string
          is_active?: boolean
          last_run_at?: string | null
          run_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          trigger_type?: string
          trigger_config?: string | null
          actions?: string
          is_active?: boolean
          last_run_at?: string | null
          run_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      automation_logs: {
        Row: {
          id: string
          workflow_id: string
          lead_id: string | null
          execution_id: string
          status: string
          trigger_data: string | null
          execution_result: string | null
          error_message: string | null
          started_at: string
          completed_at: string | null
          duration_ms: number | null
        }
        Insert: {
          id?: string
          workflow_id: string
          lead_id?: string | null
          execution_id: string
          status: string
          trigger_data?: string | null
          execution_result?: string | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
        }
        Update: {
          id?: string
          workflow_id?: string
          lead_id?: string | null
          execution_id?: string
          status?: string
          trigger_data?: string | null
          execution_result?: string | null
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          origin: string | null
          status: string
          consultant_id: string
          score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          origin?: string | null
          status?: string
          consultant_id: string
          score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          origin?: string | null
          status?: string
          consultant_id?: string
          score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_consultant_id_fkey"
            columns: ["consultant_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      interactions: {
        Row: {
          id: string
          lead_id: string
          type: string
          content: string | null
          transcription: string | null
          ai_summary: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          content?: string | null
          transcription?: string | null
          ai_summary?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          content?: string | null
          transcription?: string | null
          ai_summary?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          lead_id: string
          title: string
          description: string | null
          due_date: string | null
          status: string
          assigned_to: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          title: string
          description?: string | null
          due_date?: string | null
          status?: string
          assigned_to: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          status?: string
          assigned_to?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          lead_id: string
          title: string
          scheduled_at: string
          meeting_url: string | null
          status: string
          type: string
          transcription: string | null
          ai_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          title: string
          scheduled_at: string
          meeting_url?: string | null
          status?: string
          type?: string
          transcription?: string | null
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          title?: string
          scheduled_at?: string
          meeting_url?: string | null
          status?: string
          type?: string
          transcription?: string | null
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status: 'lead_qualificado' | 'contato_inicial' | 'reuniao_agendada' | 'discovery_concluido' | 'proposta_apresentada' | 'em_negociacao' | 'cliente_ativo'
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      meeting_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
      meeting_type: 'r1_discovery' | 'r2_proposta' | 'follow_up' | 'onboarding'
      interaction_type: 'audio' | 'note' | 'meeting' | 'call' | 'email' | 'whatsapp'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
