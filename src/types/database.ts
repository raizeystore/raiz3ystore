export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: number;
          metadata: Json;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          metadata?: Json;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["product_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          title: string;
          type?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number | null;
          order_id: string;
          player_id: string | null;
          player_name: string | null;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total?: number | null;
          order_id: string;
          player_id?: string | null;
          player_name?: string | null;
          product_id: string;
          product_name: string;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number | null;
          order_id?: string;
          player_id?: string | null;
          player_name?: string | null;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          admin_note: string | null;
          created_at: string;
          currency: string;
          customer_note: string | null;
          id: string;
          order_number: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_note?: string | null;
          created_at?: string;
          currency?: string;
          customer_note?: string | null;
          id?: string;
          order_number: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_note?: string | null;
          created_at?: string;
          currency?: string;
          customer_note?: string | null;
          id?: string;
          order_number?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_methods: {
        Row: {
          account_identifier: string | null;
          account_label: string | null;
          code: string;
          created_at: string;
          id: string;
          instructions: string | null;
          name: string;
          sort_order: number;
          status: Database["public"]["Enums"]["product_status"];
          updated_at: string;
        };
        Insert: {
          account_identifier?: string | null;
          account_label?: string | null;
          code: string;
          created_at?: string;
          id?: string;
          instructions?: string | null;
          name: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Update: {
          account_identifier?: string | null;
          account_label?: string | null;
          code?: string;
          created_at?: string;
          id?: string;
          instructions?: string | null;
          name?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_receipts: {
        Row: {
          confidence: number | null;
          created_at: string;
          extracted_amount: number | null;
          extracted_at: string | null;
          extracted_reference: string | null;
          file_size_bytes: number | null;
          id: string;
          mime_type: string | null;
          original_filename: string | null;
          payment_id: string;
          review_reason: string | null;
          status: Database["public"]["Enums"]["receipt_status"];
          storage_path: string;
          updated_at: string;
        };
        Insert: {
          confidence?: number | null;
          created_at?: string;
          extracted_amount?: number | null;
          extracted_at?: string | null;
          extracted_reference?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          mime_type?: string | null;
          original_filename?: string | null;
          payment_id: string;
          review_reason?: string | null;
          status?: Database["public"]["Enums"]["receipt_status"];
          storage_path: string;
          updated_at?: string;
        };
        Update: {
          confidence?: number | null;
          created_at?: string;
          extracted_amount?: number | null;
          extracted_at?: string | null;
          extracted_reference?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          mime_type?: string | null;
          original_filename?: string | null;
          payment_id?: string;
          review_reason?: string | null;
          status?: Database["public"]["Enums"]["receipt_status"];
          storage_path?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_receipts_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          id: string;
          order_id: string;
          paid_at: string | null;
          payment_method_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          transaction_reference: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id: string;
          paid_at?: string | null;
          payment_method_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_reference?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id?: string;
          paid_at?: string | null;
          payment_method_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_reference?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey";
            columns: ["payment_method_id"];
            isOneToOne: false;
            referencedRelation: "payment_methods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          game_id: string;
          id: string;
          name: string;
          price: number;
          sku: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["product_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          game_id: string;
          id?: string;
          name: string;
          price: number;
          sku?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          game_id?: string;
          id?: string;
          name?: string;
          price?: number;
          sku?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          is_active: boolean;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          is_active?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_active?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      order_status:
        | "pending_payment"
        | "payment_review"
        | "paid"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
        | "rejected";
      payment_status:
        | "pending"
        | "under_review"
        | "confirmed"
        | "rejected"
        | "refunded";
      product_status: "active" | "inactive" | "archived";
      receipt_status:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "manual_review";
      user_role: "customer" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
