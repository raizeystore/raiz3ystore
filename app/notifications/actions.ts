"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login?message=login_required");
  return { supabase, userId };
}

export async function markNotificationRead(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  if (!UUID_RE.test(notificationId)) redirect("/notifications?error=invalid_notification");

  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) redirect("/notifications?error=update_failed");
  revalidatePath("/notifications");
  revalidatePath("/account");
}

export async function markAllNotificationsRead() {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) redirect("/notifications?error=update_failed");
  revalidatePath("/notifications");
  revalidatePath("/account");
}
