import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only privileged client for trusted backend operations such as
 * checkout creation and admin mutations. Never import this from Client Components.
 *
 * This client intentionally stays schema-agnostic so backend-only RPCs can be
 * deployed immediately after a database migration. Public/user-scoped clients
 * remain typed from src/types/database.ts.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing server-only Supabase configuration.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
