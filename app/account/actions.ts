"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (displayName.length > 80 || phone.length > 30) {
    redirect("/account?error=invalid_profile");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login?error=session_required");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      phone: phone || null,
    })
    .eq("id", userId);

  if (error) redirect("/account?error=update_failed");

  revalidatePath("/account");
  redirect("/account?message=profile_updated");
}
