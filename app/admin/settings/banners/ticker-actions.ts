"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/database";

type Status = Database["public"]["Enums"]["product_status"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set<Status>(["active", "inactive", "archived"]);

function text(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function optionalDate(formData: FormData, key: string) {
  const value = text(formData, key, 40);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export async function saveTickerMessage(formData: FormData) {
  const { userId } = await requireAdmin();
  const tickerId = text(formData, "tickerId", 64) || null;
  const message = text(formData, "message", 180);
  const status = text(formData, "status", 16) as Status;
  const sortOrder = Number(text(formData, "sortOrder", 12) || "0");
  const startsAt = optionalDate(formData, "startsAt");
  const endsAt = optionalDate(formData, "endsAt");

  if (
    (tickerId !== null && !UUID_RE.test(tickerId)) ||
    message.length < 2 ||
    !STATUSES.has(status) ||
    !Number.isInteger(sortOrder) ||
    sortOrder < 0 ||
    startsAt === undefined ||
    endsAt === undefined ||
    (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt))
  ) {
    redirect("/admin/settings/banners?error=invalid_ticker");
  }

  const typedAdmin = createAdminClient();
  const admin = typedAdmin as unknown as SupabaseClient;
  const payload = {
    message,
    status,
    sort_order: sortOrder,
    starts_at: startsAt,
    ends_at: endsAt,
    updated_at: new Date().toISOString(),
  };

  let entityId = tickerId;
  if (tickerId) {
    const { data: existing } = await admin.from("ticker_messages").select("id").eq("id", tickerId).maybeSingle();
    if (!existing) redirect("/admin/settings/banners?error=ticker_not_found");
    const { error } = await admin.from("ticker_messages").update(payload).eq("id", tickerId);
    if (error) redirect("/admin/settings/banners?error=ticker_update_failed");
  } else {
    const { data: created, error } = await admin.from("ticker_messages").insert(payload).select("id").single();
    if (error || !created?.id) redirect("/admin/settings/banners?error=ticker_create_failed");
    entityId = String(created.id);
  }

  const { error: auditError } = await typedAdmin.from("audit_logs").insert({
    actor_id: userId,
    action: tickerId ? "ticker.updated" : "ticker.created",
    entity_type: "ticker_message",
    entity_id: entityId,
    metadata: { message, status, sort_order: sortOrder },
  });
  if (auditError) throw new Error("Ticker audit event could not be recorded");

  revalidatePath("/");
  revalidatePath("/admin/settings/banners");
  redirect(`/admin/settings/banners?message=${tickerId ? "ticker_updated" : "ticker_created"}`);
}
