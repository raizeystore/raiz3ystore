import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/server";

export type StoreHeaderContext = {
  signedIn: boolean;
  isAdmin: boolean;
  displayName: string | null;
  walletBalance: number;
  walletCurrency: string;
  unreadNotifications: number;
};

const ANONYMOUS_HEADER: StoreHeaderContext = {
  signedIn: false,
  isAdmin: false,
  displayName: null,
  walletBalance: 0,
  walletCurrency: "SDG",
  unreadNotifications: 0,
};

function numeric(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getStoreHeaderContext(): Promise<StoreHeaderContext> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return ANONYMOUS_HEADER;
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return ANONYMOUS_HEADER;

  const [{ data: profile }, unreadResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  const untyped = supabase as unknown as SupabaseClient;
  const { data: wallet } = await untyped
    .from("wallet_accounts")
    .select("balance, currency")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    signedIn: true,
    isAdmin: profile?.role === "admin",
    displayName: profile?.display_name ?? null,
    walletBalance: numeric(wallet?.balance),
    walletCurrency: typeof wallet?.currency === "string" ? wallet.currency : "SDG",
    unreadNotifications: unreadResult.count ?? 0,
  };
}

export async function getTickerMessages(): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  ) as SupabaseClient;

  const { data, error } = await client
    .from("ticker_messages")
    .select("message, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(12);

  if (error) return [];
  return (data ?? [])
    .map((row) => (typeof row.message === "string" ? row.message.trim() : ""))
    .filter(Boolean);
}
