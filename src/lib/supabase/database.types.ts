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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          depth: Database["public"]["Enums"]["client_depth"]
          email: string
          engagement_id: string
          headline: string
          id: string
          initials: string
          name: string
          organisation_id: string | null
          phone: string
          recurring_themes: string[]
          role: string
          started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          depth?: Database["public"]["Enums"]["client_depth"]
          email: string
          engagement_id: string
          headline?: string
          id?: string
          initials: string
          name: string
          organisation_id?: string | null
          phone?: string
          recurring_themes?: string[]
          role: string
          started_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          depth?: Database["public"]["Enums"]["client_depth"]
          email?: string
          engagement_id?: string
          headline?: string
          id?: string
          initials?: string
          name?: string
          organisation_id?: string | null
          phone?: string
          recurring_themes?: string[]
          role?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          created_at: string
          credential: string
          email: string
          focus: string
          id: string
          initials: string
          name: string
          title: string
        }
        Insert: {
          created_at?: string
          credential: string
          email: string
          focus: string
          id?: string
          initials: string
          name: string
          title: string
        }
        Update: {
          created_at?: string
          credential?: string
          email?: string
          focus?: string
          id?: string
          initials?: string
          name?: string
          title?: string
        }
        Relationships: []
      }
      coaching_agreements: {
        Row: {
          agreed_at: string
          cadence: string
          client_id: string
          client_responsibility: string
          confidentiality: string
          ethics: string
          purpose: string
          scope: string
          sponsor_sharing: string
        }
        Insert: {
          agreed_at: string
          cadence: string
          client_id: string
          client_responsibility: string
          confidentiality: string
          ethics: string
          purpose: string
          scope: string
          sponsor_sharing: string
        }
        Update: {
          agreed_at?: string
          cadence?: string
          client_id?: string
          client_responsibility?: string
          confidentiality?: string
          ethics?: string
          purpose?: string
          scope?: string
          sponsor_sharing?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          client_id: string
          client_note: string | null
          completed_at: string | null
          created_at: string
          date: string
          due_label: string
          id: string
          session_id: string
          status: Database["public"]["Enums"]["commitment_status"]
          text: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_note?: string | null
          completed_at?: string | null
          created_at?: string
          date: string
          due_label?: string
          id?: string
          session_id: string
          status?: Database["public"]["Enums"]["commitment_status"]
          text: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_note?: string | null
          completed_at?: string | null
          created_at?: string
          date?: string
          due_label?: string
          id?: string
          session_id?: string
          status?: Database["public"]["Enums"]["commitment_status"]
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      development_goals: {
        Row: {
          baseline: string
          client_id: string
          client_wording: string
          headline: string
          horizon: string
          success_criteria: string[]
        }
        Insert: {
          baseline: string
          client_id: string
          client_wording: string
          headline: string
          horizon: string
          success_criteria?: string[]
        }
        Update: {
          baseline?: string
          client_id?: string
          client_wording?: string
          headline?: string
          horizon?: string
          success_criteria?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "development_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          date: string
          description: string
          expires_at: string | null
          file_name: string | null
          id: string
          kind: string
          mime_type: string | null
          owner_id: string
          owner_type: Database["public"]["Enums"]["document_owner_type"]
          signed_at: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by_coach_id: string | null
          visibility: Database["public"]["Enums"]["confidentiality_level"]
        }
        Insert: {
          created_at?: string
          date: string
          description?: string
          expires_at?: string | null
          file_name?: string | null
          id?: string
          kind: string
          mime_type?: string | null
          owner_id: string
          owner_type: Database["public"]["Enums"]["document_owner_type"]
          signed_at?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by_coach_id?: string | null
          visibility: Database["public"]["Enums"]["confidentiality_level"]
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          expires_at?: string | null
          file_name?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          owner_id?: string
          owner_type?: Database["public"]["Enums"]["document_owner_type"]
          signed_at?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by_coach_id?: string | null
          visibility?: Database["public"]["Enums"]["confidentiality_level"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_coach_id_fkey"
            columns: ["uploaded_by_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          coach_id: string
          created_at: string
          end_date: string
          id: string
          kind: Database["public"]["Enums"]["engagement_kind"]
          kind_label: string
          next_review_date: string | null
          next_review_label: string | null
          organisation_id: string | null
          period_label: string
          purpose: string
          scope_note: string
          sponsor_reporting: string
          start_date: string
          status: Database["public"]["Enums"]["engagement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          end_date: string
          id?: string
          kind: Database["public"]["Enums"]["engagement_kind"]
          kind_label: string
          next_review_date?: string | null
          next_review_label?: string | null
          organisation_id?: string | null
          period_label: string
          purpose: string
          scope_note: string
          sponsor_reporting: string
          start_date: string
          status: Database["public"]["Enums"]["engagement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          end_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["engagement_kind"]
          kind_label?: string
          next_review_date?: string | null
          next_review_label?: string | null
          organisation_id?: string | null
          period_label?: string
          purpose?: string
          scope_note?: string
          sponsor_reporting?: string
          start_date?: string
          status?: Database["public"]["Enums"]["engagement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagements_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          session_id: string
          text: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          id?: string
          session_id: string
          text: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          session_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          background: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          need: string | null
          organisation_name: string | null
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          background?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          need?: string | null
          organisation_name?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          background?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          need?: string | null
          organisation_name?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: Database["public"]["Enums"]["material_category"]
          comment: string | null
          created_at: string
          created_by_id: string
          created_by_role: Database["public"]["Enums"]["material_created_by_role"]
          file_name: string | null
          id: string
          link_type: Database["public"]["Enums"]["material_link_type"]
          linked_commitment_id: string | null
          linked_session_id: string | null
          mime_type: string | null
          note_text: string | null
          owner_client_id: string
          sharing_level: Database["public"]["Enums"]["material_sharing_level"]
          size_bytes: number | null
          source: Database["public"]["Enums"]["material_source"]
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["material_category"]
          comment?: string | null
          created_at?: string
          created_by_id: string
          created_by_role: Database["public"]["Enums"]["material_created_by_role"]
          file_name?: string | null
          id?: string
          link_type?: Database["public"]["Enums"]["material_link_type"]
          linked_commitment_id?: string | null
          linked_session_id?: string | null
          mime_type?: string | null
          note_text?: string | null
          owner_client_id: string
          sharing_level: Database["public"]["Enums"]["material_sharing_level"]
          size_bytes?: number | null
          source: Database["public"]["Enums"]["material_source"]
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["material_category"]
          comment?: string | null
          created_at?: string
          created_by_id?: string
          created_by_role?: Database["public"]["Enums"]["material_created_by_role"]
          file_name?: string | null
          id?: string
          link_type?: Database["public"]["Enums"]["material_link_type"]
          linked_commitment_id?: string | null
          linked_session_id?: string | null
          mime_type?: string | null
          note_text?: string | null
          owner_client_id?: string
          sharing_level?: Database["public"]["Enums"]["material_sharing_level"]
          size_bytes?: number | null
          source?: Database["public"]["Enums"]["material_source"]
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_linked_commitment_id_fkey"
            columns: ["linked_commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_linked_session_id_fkey"
            columns: ["linked_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_owner_client_id_fkey"
            columns: ["owner_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          date: string
          engagement_id: string
          id: string
          label: string
          status: Database["public"]["Enums"]["milestone_status"]
        }
        Insert: {
          date: string
          engagement_id: string
          id?: string
          label: string
          status: Database["public"]["Enums"]["milestone_status"]
        }
        Update: {
          date?: string
          engagement_id?: string
          id?: string
          label?: string
          status?: Database["public"]["Enums"]["milestone_status"]
        }
        Relationships: [
          {
            foreignKeyName: "milestones_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          industry: string
          location: string
          name: string
          size_label: string
          sponsor_name: string | null
          sponsor_role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry: string
          location: string
          name: string
          size_label: string
          sponsor_name?: string | null
          sponsor_role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string
          location?: string
          name?: string
          size_label?: string
          sponsor_name?: string | null
          sponsor_role?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string | null
          coach_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["portal_role"]
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["portal_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          prompt: string
          session_id: string | null
          text: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          id?: string
          prompt?: string
          session_id?: string | null
          text: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          prompt?: string
          session_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_booking_requests: {
        Row: {
          client_id: string
          created_at: string
          date: string
          duration_minutes: number
          id: string
          location: string
          message: string | null
          requested_by_role: Database["public"]["Enums"]["booking_role"]
          responded_at: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          time: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          duration_minutes?: number
          id?: string
          location?: string
          message?: string | null
          requested_by_role: Database["public"]["Enums"]["booking_role"]
          responded_at?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          time?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          location?: string
          message?: string | null
          requested_by_role?: Database["public"]["Enums"]["booking_role"]
          responded_at?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_booking_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_booking_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_coach_notes: {
        Row: {
          coach_id: string
          created_at: string
          notes: string
          session_id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          notes: string
          session_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          notes?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_coach_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_coach_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_preparations: {
        Row: {
          changed: string
          client_id: string
          desired_outcome: string
          focus: string
          follow_up: string
          id: string
          session_id: string | null
          updated_at: string
        }
        Insert: {
          changed?: string
          client_id: string
          desired_outcome?: string
          focus?: string
          follow_up?: string
          id?: string
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          changed?: string
          client_id?: string
          desired_outcome?: string
          focus?: string
          follow_up?: string
          id?: string
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_preparations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_preparations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_summaries: {
        Row: {
          approved: boolean
          approved_at: string | null
          awareness: string
          commitments: string[]
          focus: string
          follow_up: string[]
          insights: string[]
          new_perspectives: string[]
          possible_next_focus: string
          session_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          awareness?: string
          commitments?: string[]
          focus?: string
          follow_up?: string[]
          insights?: string[]
          new_perspectives?: string[]
          possible_next_focus?: string
          session_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          awareness?: string
          commitments?: string[]
          focus?: string
          follow_up?: string[]
          insights?: string[]
          new_perspectives?: string[]
          possible_next_focus?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_focus: string
          client_id: string
          created_at: string
          date: string
          desired_outcome: string
          duration_minutes: number
          id: string
          location: string
          number: number
          status: Database["public"]["Enums"]["session_status"]
          time: string
          updated_at: string
        }
        Insert: {
          client_focus?: string
          client_id: string
          created_at?: string
          date: string
          desired_outcome?: string
          duration_minutes?: number
          id?: string
          location?: string
          number: number
          status: Database["public"]["Enums"]["session_status"]
          time?: string
          updated_at?: string
        }
        Update: {
          client_focus?: string
          client_id?: string
          created_at?: string
          date?: string
          desired_outcome?: string
          duration_minutes?: number
          id?: string
          location?: string
          number?: number
          status?: Database["public"]["Enums"]["session_status"]
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_session_booking: {
        Args: { p_booking_id: string }
        Returns: string
      }
      cancel_session_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      client_owned_by_current_coach: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      complete_coaching_session: {
        Args: {
          p_session_id: string
          p_awareness: string
          p_insights: string[]
          p_commitments: string[]
          p_follow_up: string[]
          p_possible_next_focus: string
        }
        Returns: string
      }
      create_client_bundle: {
        Args: {
          p_agreement: Json
          p_client: Json
          p_engagement: Json
          p_goal: Json
          p_new_organisation?: Json
          p_organisation_id?: string
        }
        Returns: string
      }
      current_client_id: { Args: never; Returns: string }
      current_coach_id: { Args: never; Returns: string }
      decline_session_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      session_owned_by_current_coach: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      update_own_client_profile: {
        Args: {
          p_email: string
          p_name: string
          p_phone: string
          p_role: string
        }
        Returns: undefined
      }
      update_own_commitment_status: {
        Args: {
          p_client_note: string
          p_commitment_id: string
          p_completed_at: string
          p_status: Database["public"]["Enums"]["commitment_status"]
        }
        Returns: undefined
      }
      upsert_coach_meeting_exploration: {
        Args: { p_follow_up: string; p_session_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_role: "coach" | "klient"
      booking_status: "pending" | "accepted" | "declined" | "cancelled"
      client_depth: "full" | "oversikt"
      commitment_status: "oppet" | "pagar" | "genomfort"
      confidentiality_level: "coach" | "coach_klient" | "organisation"
      document_owner_type: "klient" | "uppdrag" | "coach"
      document_status: "aktiv" | "arkiverad"
      engagement_kind: "individuell" | "ledarutveckling" | "program"
      engagement_status: "planering" | "pagaende" | "avslutat"
      material_category:
        | "arbetsmaterial"
        | "underlag"
        | "utvardering"
        | "anteckning"
        | "ovrigt"
      material_created_by_role: "klient" | "coach"
      material_link_type:
        | "goal"
        | "next_session"
        | "session"
        | "commitment"
        | "none"
      material_sharing_level: "private" | "shared_coach"
      material_source: "client_upload" | "client_note" | "coach_shared"
      milestone_status: "genomford" | "pagaende" | "kommande"
      portal_role: "coach" | "klient"
      session_status: "genomford" | "kommande"
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
      booking_role: ["coach", "klient"],
      booking_status: ["pending", "accepted", "declined", "cancelled"],
      client_depth: ["full", "oversikt"],
      commitment_status: ["oppet", "pagar", "genomfort"],
      confidentiality_level: ["coach", "coach_klient", "organisation"],
      document_owner_type: ["klient", "uppdrag", "coach"],
      document_status: ["aktiv", "arkiverad"],
      engagement_kind: ["individuell", "ledarutveckling", "program"],
      engagement_status: ["planering", "pagaende", "avslutat"],
      material_category: [
        "arbetsmaterial",
        "underlag",
        "utvardering",
        "anteckning",
        "ovrigt",
      ],
      material_created_by_role: ["klient", "coach"],
      material_link_type: [
        "goal",
        "next_session",
        "session",
        "commitment",
        "none",
      ],
      material_sharing_level: ["private", "shared_coach"],
      material_source: ["client_upload", "client_note", "coach_shared"],
      milestone_status: ["genomford", "pagaende", "kommande"],
      portal_role: ["coach", "klient"],
      session_status: ["genomford", "kommande"],
    },
  },
} as const
