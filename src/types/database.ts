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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          button_text: string | null
          created_at: string
          ends_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          mobile_image_url: string | null
          sort_order: number
          starts_at: string | null
          status: Database["public"]["Enums"]["product_status"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          customer_inputs: Json
          id: string
          line_total: number | null
          order_id: string
          player_id: string | null
          player_name: string | null
          product_id: string
          product_name: string
          quantity: number
          suboption_id: string | null
          suboption_name: string | null
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          customer_inputs?: Json
          id?: string
          line_total?: number | null
          order_id: string
          player_id?: string | null
          player_name?: string | null
          product_id: string
          product_name: string
          quantity?: number
          suboption_id?: string | null
          suboption_name?: string | null
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          customer_inputs?: Json
          id?: string
          line_total?: number | null
          order_id?: string
          player_id?: string | null
          player_name?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          suboption_id?: string | null
          suboption_name?: string | null
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_suboption_id_fkey"
            columns: ["suboption_id"]
            isOneToOne: false
            referencedRelation: "product_suboptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: number
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          created_at: string
          currency: string
          customer_note: string | null
          id: string
          idempotency_key: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          id?: string
          idempotency_key?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          currency?: string
          customer_note?: string | null
          id?: string
          idempotency_key?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_identifier: string | null
          account_label: string | null
          code: string
          created_at: string
          id: string
          instructions: string | null
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          account_identifier?: string | null
          account_label?: string | null
          code: string
          created_at?: string
          id?: string
          instructions?: string | null
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          account_identifier?: string | null
          account_label?: string | null
          code?: string
          created_at?: string
          id?: string
          instructions?: string | null
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          confidence: number | null
          created_at: string
          extracted_amount: number | null
          extracted_at: string | null
          extracted_reference: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          payment_id: string
          review_reason: string | null
          status: Database["public"]["Enums"]["receipt_status"]
          storage_path: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          extracted_amount?: number | null
          extracted_at?: string | null
          extracted_reference?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          payment_id: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          storage_path: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          extracted_amount?: number | null
          extracted_at?: string | null
          extracted_reference?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          payment_id?: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          paid_at: string | null
          payment_method_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_method_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_method_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_input_fields: {
        Row: {
          created_at: string
          field_key: string
          id: string
          input_type: string
          is_required: boolean
          label: string
          max_length: number | null
          min_length: number | null
          placeholder: string | null
          product_id: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          id?: string
          input_type?: string
          is_required?: boolean
          label: string
          max_length?: number | null
          min_length?: number | null
          placeholder?: string | null
          product_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          id?: string
          input_type?: string
          is_required?: boolean
          label?: string
          max_length?: number | null
          min_length?: number | null
          placeholder?: string | null
          product_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_input_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suboptions: {
        Row: {
          created_at: string
          id: string
          name: string
          price_usd: number
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_usd: number
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_usd?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suboptions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price_usd: number
          product_id: string
          sku: string | null
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_usd: number
          product_id: string
          sku?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_usd?: number
          product_id?: string
          sku?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price_usd: number | null
          created_at: string
          currency: string
          description: string | null
          game_id: string | null
          id: string
          image_url: string | null
          name: string
          player_id_label: string
          player_id_required: boolean
          player_name_label: string
          player_name_required: boolean
          price: number
          pricing_mode: string
          profit_margin_override: number | null
          sku: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          subcategory_id: string | null
          suboptions_required: boolean
          updated_at: string
        }
        Insert: {
          base_price_usd?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          player_id_label?: string
          player_id_required?: boolean
          player_name_label?: string
          player_name_required?: boolean
          price: number
          pricing_mode?: string
          profit_margin_override?: number | null
          sku?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          suboptions_required?: boolean
          updated_at?: string
        }
        Update: {
          base_price_usd?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          game_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          player_id_label?: string
          player_id_required?: boolean
          player_name_label?: string
          player_name_required?: boolean
          price?: number
          pricing_mode?: string
          profit_margin_override?: number | null
          sku?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          subcategory_id?: string | null
          suboptions_required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          privacy_accepted_at: string | null
          privacy_version: string | null
          role: Database["public"]["Enums"]["user_role"]
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          privacy_accepted_at?: string | null
          privacy_version?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          currency: string
          default_profit_margin: number
          id: number
          updated_at: string
          updated_by: string | null
          usd_to_sdg_rate: number
        }
        Insert: {
          currency?: string
          default_profit_margin?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
          usd_to_sdg_rate?: number
        }
        Update: {
          currency?: string
          default_profit_margin?: number
          id?: number
          updated_at?: string
          updated_by?: string | null
          usd_to_sdg_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_popular_products_server: {
        Args: { p_limit?: number }
        Returns: {
          product_id: string
          total_quantity: number
        }[]
      }
      admin_progress_order: {
        Args: {
          p_admin_id: string
          p_next_status: Database["public"]["Enums"]["order_status"]
          p_note: string
          p_order_id: string
        }
        Returns: {
          order_id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
        }[]
      }
      admin_review_payment: {
        Args: {
          p_admin_id: string
          p_decision: string
          p_payment_id: string
          p_review_reason: string
        }
        Returns: {
          order_id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
        }[]
      }
      create_checkout_order: {
        Args: {
          p_customer_note: string
          p_idempotency_key: string
          p_payment_method_id: string
          p_player_id: string
          p_player_name: string
          p_product_id: string
          p_user_id: string
        }
        Returns: {
          currency: string
          order_id: string
          order_number: string
          payment_id: string
          total: number
        }[]
      }
      submit_payment_receipt: {
        Args: {
          p_file_size_bytes: number
          p_mime_type: string
          p_original_filename: string
          p_payment_id: string
          p_storage_path: string
          p_user_id: string
        }
        Returns: {
          order_id: string
          order_number: string
          receipt_id: string
        }[]
      }
    }
    Enums: {
      order_status:
        | "pending_payment"
        | "payment_review"
        | "paid"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
        | "rejected"
      payment_status:
        | "pending"
        | "under_review"
        | "confirmed"
        | "rejected"
        | "refunded"
      product_status: "active" | "inactive" | "archived"
      receipt_status:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "manual_review"
      user_role: "customer" | "admin"
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
      order_status: [
        "pending_payment",
        "payment_review",
        "paid",
        "processing",
        "completed",
        "cancelled",
        "refunded",
        "rejected",
      ],
      payment_status: [
        "pending",
        "under_review",
        "confirmed",
        "rejected",
        "refunded",
      ],
      product_status: ["active", "inactive", "archived"],
      receipt_status: [
        "pending",
        "processing",
        "approved",
        "rejected",
        "manual_review",
      ],
      user_role: ["customer", "admin"],
    },
  },
} as const
