// Generated from the RAIZ3Y STORE Supabase schema.
// Regenerate after every database migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "admin";
export type ProductStatus = "active" | "inactive" | "archived";
export type OrderStatus = "pending_payment" | "payment_review" | "paid" | "processing" | "completed" | "cancelled" | "refunded" | "rejected";
export type PaymentStatus = "pending" | "under_review" | "confirmed" | "rejected" | "refunded";
export type ReceiptStatus = "pending" | "processing" | "approved" | "rejected" | "manual_review";

export interface Database {
  public: {
    Tables: {
      profiles: { Row: { id: string; display_name: string | null; phone: string | null; role: UserRole; is_active: boolean; created_at: string; updated_at: string } };
      games: { Row: { id: string; name: string; slug: string; description: string | null; image_url: string | null; status: ProductStatus; sort_order: number; created_at: string; updated_at: string } };
      products: { Row: { id: string; game_id: string; name: string; slug: string; description: string | null; sku: string | null; price: number; currency: string; status: ProductStatus; sort_order: number; created_at: string; updated_at: string } };
      payment_methods: { Row: { id: string; name: string; code: string; instructions: string | null; account_label: string | null; account_identifier: string | null; status: ProductStatus; sort_order: number; created_at: string; updated_at: string } };
      orders: { Row: { id: string; order_number: string; user_id: string; status: OrderStatus; currency: string; subtotal: number; total: number; customer_note: string | null; admin_note: string | null; created_at: string; updated_at: string } };
      order_items: { Row: { id: string; order_id: string; product_id: string; product_name: string; unit_price: number; quantity: number; line_total: number | null; player_id: string | null; player_name: string | null; created_at: string } };
      payments: { Row: { id: string; order_id: string; payment_method_id: string; amount: number; currency: string; status: PaymentStatus; transaction_reference: string | null; paid_at: string | null; reviewed_at: string | null; reviewed_by: string | null; created_at: string; updated_at: string } };
      payment_receipts: { Row: { id: string; payment_id: string; storage_path: string; original_filename: string | null; mime_type: string | null; file_size_bytes: number | null; status: ReceiptStatus; extracted_amount: number | null; extracted_reference: string | null; extracted_at: string | null; confidence: number | null; review_reason: string | null; created_at: string; updated_at: string } };
      notifications: { Row: { id: string; user_id: string; title: string; body: string; type: string; read_at: string | null; created_at: string } };
      audit_logs: { Row: { id: number; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string } };
    };
  };
}
