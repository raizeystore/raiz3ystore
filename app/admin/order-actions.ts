"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function progressOrder(formData: FormData) {
  const { userId } = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  if (!UUID_RE.test(orderId) || (nextStatus !== "processing" && nextStatus !== "completed")) {
    redirect("/admin?error=invalid_order_transition");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_progress_order", {
    p_admin_id: userId,
    p_order_id: orderId,
    p_next_status: nextStatus,
    p_note: note,
  });

  const result = data?.[0];
  if (error || !result?.order_number) redirect("/admin?error=order_progress_failed");

  revalidatePath("/admin");
  revalidatePath("/orders");
  revalidatePath(`/orders/${result.order_number}`);
  redirect(`/admin?message=order_${nextStatus}`);
}
