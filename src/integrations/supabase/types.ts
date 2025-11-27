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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_metrics: {
        Row: {
          campaign_id: string
          clicks: number | null
          cpc: number | null
          cpl: number | null
          created_at: string | null
          ctr: number | null
          day: string
          id: string
          impressions: number | null
          leads: number | null
          raw: Json | null
          spend: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string | null
          ctr?: number | null
          day: string
          id?: string
          impressions?: number | null
          leads?: number | null
          raw?: Json | null
          spend?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          cpc?: number | null
          cpl?: number | null
          created_at?: string | null
          ctr?: number | null
          day?: string
          id?: string
          impressions?: number | null
          leads?: number | null
          raw?: Json | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ad_copy: string | null
          audience_targeting: Json
          budget: number
          campaign_assets: Json | null
          created_at: string
          created_by: string
          creatives: Json | null
          cta_button: string | null
          currency: string | null
          destination_url: string | null
          end_date: string | null
          id: string
          job_id: string | null
          location_targeting: Json
          name: string
          objective: string
          org_id: string | null
          organization_id: string | null
          platform: string | null
          start_date: string | null
          status: string
          targeting: Json | null
          updated_at: string
        }
        Insert: {
          ad_copy?: string | null
          audience_targeting?: Json
          budget?: number
          campaign_assets?: Json | null
          created_at?: string
          created_by: string
          creatives?: Json | null
          cta_button?: string | null
          currency?: string | null
          destination_url?: string | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          location_targeting?: Json
          name: string
          objective: string
          org_id?: string | null
          organization_id?: string | null
          platform?: string | null
          start_date?: string | null
          status?: string
          targeting?: Json | null
          updated_at?: string
        }
        Update: {
          ad_copy?: string | null
          audience_targeting?: Json
          budget?: number
          campaign_assets?: Json | null
          created_at?: string
          created_by?: string
          creatives?: Json | null
          cta_button?: string | null
          currency?: string | null
          destination_url?: string | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          location_targeting?: Json
          name?: string
          objective?: string
          org_id?: string | null
          organization_id?: string | null
          platform?: string | null
          start_date?: string | null
          status?: string
          targeting?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string
          account_name: string | null
          ad_account_id: string[] | null
          created_at: string
          expires_at: string | null
          id: string
          integration_type: string
          last_sync_at: string | null
          org_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          account_name?: string | null
          ad_account_id?: string[] | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_type: string
          last_sync_at?: string | null
          org_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          account_name?: string | null
          ad_account_id?: string[] | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          org_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted: boolean | null
          ad_account_id: string[] | null
          created_at: string | null
          email: string
          id: string
          org_id: string
          role: string
          token: string
        }
        Insert: {
          accepted?: boolean | null
          ad_account_id?: string[] | null
          created_at?: string | null
          email: string
          id?: string
          org_id: string
          role?: string
          token: string
        }
        Update: {
          accepted?: boolean | null
          ad_account_id?: string[] | null
          created_at?: string | null
          email?: string
          id?: string
          org_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string | null
          created_at: string
          created_by: string
          description: string | null
          external_id: string | null
          id: string
          location: string | null
          org_id: string | null
          organization_id: string | null
          status: string
          title: string
          updated_at: string
          vacancy_url: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          org_id?: string | null
          organization_id?: string | null
          status?: string
          title: string
          updated_at?: string
          vacancy_url?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          org_id?: string | null
          organization_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          vacancy_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          campaign_id: string
          clicks: number
          created_at: string
          date: string
          id: string
          impressions: number
          leads: number
          spend: number
        }
        Insert: {
          campaign_id: string
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          leads?: number
          spend?: number
        }
        Update: {
          campaign_id?: string
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          leads?: number
          spend?: number
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          google_sheet_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          google_sheet_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          google_sheet_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          wallet_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          wallet_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          card_status: string | null
          created_at: string
          currency: string
          id: string
          org_id: string
          stripe_card_id: string | null
          stripe_cardholder_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          card_status?: string | null
          created_at?: string
          currency?: string
          id?: string
          org_id: string
          stripe_card_id?: string | null
          stripe_cardholder_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          card_status?: string | null
          created_at?: string
          currency?: string
          id?: string
          org_id?: string
          stripe_card_id?: string | null
          stripe_cardholder_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_create_org_if_missing: {
        Args: { p_email: string; p_name: string; p_user_id: string }
        Returns: string
      }
      create_campaign: {
        Args: {
          p_ad_copy?: string
          p_budget: number
          p_creatives?: Json
          p_cta?: string
          p_currency?: string
          p_destination_url?: string
          p_end_date?: string
          p_job_id: string
          p_name: string
          p_objective: string
          p_org_id: string
          p_start_date?: string
          p_targeting?: Json
        }
        Returns: string
      }
      get_user_org_role: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: string
      }
      get_user_platform_connections: {
        Args: { p_user_ids: string[] }
        Returns: {
          has_meta: boolean
          has_tiktok: boolean
          user_id: string
        }[]
      }
      is_org_member: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: boolean
      }
      publish_campaign: {
        Args: { p_campaign_id: string; p_requester: string }
        Returns: boolean
      }
      sync_profile_data: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
