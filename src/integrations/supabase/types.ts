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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          period: string
          start_date: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          period: string
          start_date: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          period?: string
          start_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_default: boolean | null
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          default_currency: string | null
          is_active: boolean | null
          name: string
          tax_system: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_currency?: string | null
          is_active?: boolean | null
          name: string
          tax_system?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_currency?: string | null
          is_active?: boolean | null
          name?: string
          tax_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "countries_default_currency_fkey"
            columns: ["default_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      currency_exchange_rates: {
        Row: {
          created_at: string | null
          from_currency: string | null
          id: string
          rate: number
          rate_date: string
          source: string | null
          to_currency: string | null
        }
        Insert: {
          created_at?: string | null
          from_currency?: string | null
          id?: string
          rate: number
          rate_date?: string
          source?: string | null
          to_currency?: string | null
        }
        Update: {
          created_at?: string | null
          from_currency?: string | null
          id?: string
          rate?: number
          rate_date?: string
          source?: string | null
          to_currency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "currency_exchange_rates_from_currency_fkey"
            columns: ["from_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "currency_exchange_rates_to_currency_fkey"
            columns: ["to_currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      financial_insights: {
        Row: {
          content: string
          content_hash: string | null
          created_at: string
          generation_trigger: string | null
          id: string
          insight_type: string
          is_read: boolean | null
          last_generated_at: string | null
          period_end: string | null
          period_start: string | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          content_hash?: string | null
          created_at?: string
          generation_trigger?: string | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          last_generated_at?: string | null
          period_end?: string | null
          period_start?: string | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          content_hash?: string | null
          created_at?: string
          generation_trigger?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          last_generated_at?: string | null
          period_end?: string | null
          period_start?: string | null
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ph_tax_brackets: {
        Row: {
          base_tax: number
          bracket_order: number
          created_at: string | null
          excess_over: number
          id: string
          is_active: boolean | null
          max_income: number | null
          min_income: number
          tax_rate: number
          tax_year: number
        }
        Insert: {
          base_tax?: number
          bracket_order: number
          created_at?: string | null
          excess_over?: number
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          min_income: number
          tax_rate: number
          tax_year: number
        }
        Update: {
          base_tax?: number
          bracket_order?: number
          created_at?: string | null
          excess_over?: number
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          min_income?: number
          tax_rate?: number
          tax_year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string
          created_at: string | null
          currency: string
          email: string | null
          full_name: string | null
          id: string
          locale: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string
          created_at?: string | null
          currency?: string
          email?: string | null
          full_name?: string | null
          id: string
          locale?: string
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string
          created_at?: string | null
          currency?: string
          email?: string | null
          full_name?: string | null
          id?: string
          locale?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          currency: string | null
          current_amount: number | null
          description: string | null
          id: string
          name: string
          salary_date_1: number | null
          salary_date_2: number | null
          savings_percentage_threshold: number | null
          target_amount: number
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          name: string
          salary_date_1?: number | null
          salary_date_2?: number | null
          savings_percentage_threshold?: number | null
          target_amount: number
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          name?: string
          salary_date_1?: number | null
          salary_date_2?: number | null
          savings_percentage_threshold?: number | null
          target_amount?: number
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supported_currencies: {
        Row: {
          code: string
          created_at: string | null
          decimal_places: number | null
          is_active: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      tax_calculations: {
        Row: {
          calculation_breakdown: Json | null
          calculation_name: string | null
          calculation_type: string
          country_code: string | null
          created_at: string | null
          currency: string | null
          gross_income: number | null
          id: string
          input_data: Json
          is_filed: boolean | null
          is_saved: boolean | null
          notes: string | null
          tax_due: number | null
          tax_payable: number | null
          tax_refund: number | null
          tax_withheld: number | null
          tax_year: number
          taxable_income: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calculation_breakdown?: Json | null
          calculation_name?: string | null
          calculation_type: string
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          gross_income?: number | null
          id?: string
          input_data: Json
          is_filed?: boolean | null
          is_saved?: boolean | null
          notes?: string | null
          tax_due?: number | null
          tax_payable?: number | null
          tax_refund?: number | null
          tax_withheld?: number | null
          tax_year: number
          taxable_income?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calculation_breakdown?: Json | null
          calculation_name?: string | null
          calculation_type?: string
          country_code?: string | null
          created_at?: string | null
          currency?: string | null
          gross_income?: number | null
          id?: string
          input_data?: Json
          is_filed?: boolean | null
          is_saved?: boolean | null
          notes?: string | null
          tax_due?: number | null
          tax_payable?: number | null
          tax_refund?: number | null
          tax_withheld?: number | null
          tax_year?: number
          taxable_income?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_calculations_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "tax_calculations_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "supported_currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          receipt_name: string | null
          receipt_url: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          receipt_name?: string | null
          receipt_url?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          receipt_name?: string | null
          receipt_url?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insight_preferences: {
        Row: {
          created_at: string
          enabled_insight_types: Json
          id: string
          insight_frequency: string
          last_insight_generation: string | null
          next_generation_due: string | null
          preferred_delivery_time: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled_insight_types?: Json
          id?: string
          insight_frequency?: string
          last_insight_generation?: string | null
          next_generation_due?: string | null
          preferred_delivery_time?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled_insight_types?: Json
          id?: string
          insight_frequency?: string
          last_insight_generation?: string | null
          next_generation_due?: string | null
          preferred_delivery_time?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      savings_goal_progress: {
        Row: {
          created_at: string | null
          currency: string | null
          current_amount: number | null
          days_remaining: number | null
          description: string | null
          id: string | null
          name: string | null
          progress_percentage: number | null
          remaining_amount: number | null
          status: string | null
          target_amount: number | null
          target_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_amount?: number | null
          days_remaining?: never
          description?: string | null
          id?: string | null
          name?: string | null
          progress_percentage?: never
          remaining_amount?: never
          status?: never
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_amount?: number | null
          days_remaining?: never
          description?: string | null
          id?: string | null
          name?: string | null
          progress_percentage?: never
          remaining_amount?: never
          status?: never
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_next_generation_due: {
        Args: {
          frequency: string
          preferred_time: string
          user_timezone?: string
        }
        Returns: string
      }
      check_duplicate_insight: {
        Args: {
          p_content_hash: string
          p_insight_type: string
          p_period_end: string
          p_period_start: string
          p_user_id: string
        }
        Returns: boolean
      }
      convert_currency: {
        Args: {
          amount: number
          from_curr: string
          rate_date?: string
          to_curr: string
        }
        Returns: number
      }
      get_exchange_rate: {
        Args: { from_curr: string; rate_date?: string; to_curr: string }
        Returns: number
      }
      get_test_user_id: { Args: never; Returns: string }
      seed_user_categories: { Args: { user_id: string }; Returns: undefined }
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
