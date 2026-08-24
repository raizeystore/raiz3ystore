import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

/**
 * Server-only privileged client for trusted backend operations such as
 * checkout creation and admin mutations. Never import this from Client Components.
 *
 * SUPABASE_SECRET_KEY must remain server-only and must never use a NEXT_PUBLIC_ prefix.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Privileged Supabase client cannot run in the browser.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Missing server-only Supabase configuration.");
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
