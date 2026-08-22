import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login?message=login_required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, display_name")
    .eq("id", userId)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) {
    redirect("/account");
  }

  return { userId, profile, supabase };
}
