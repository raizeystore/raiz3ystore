"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/database";

type BannerStatus = Database["public"]["Enums"]["product_status"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set<BannerStatus>(["active", "inactive", "archived"]);

function text(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function safeNavigationUrl(formData: FormData, key: string) {
  const value = text(formData, key, 1000);
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeImageUrl(formData: FormData, key: string) {
  const value = text(formData, key, 1000);
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    const isSupabaseObject =
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/");
    return isSupabaseObject ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function optionalDate(formData: FormData, key: string) {
  const value = text(formData, key, 40);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export async function saveBanner(formData: FormData) {
  const { userId } = await requireAdmin();
  const bannerId = text(formData, "bannerId", 64) || null;
  const title = text(formData, "title", 120);
  const subtitle = text(formData, "subtitle", 240);
  const desktopImage = safeImageUrl(formData, "desktopImage");
  const mobileImage = safeImageUrl(formData, "mobileImage");
  const linkUrl = safeNavigationUrl(formData, "linkUrl");
  const buttonText = text(formData, "buttonText", 80);
  const status = text(formData, "status", 16) as BannerStatus;
  const sortOrder = Number(text(formData, "sortOrder", 12) || "0");
  const startsAt = optionalDate(formData, "startsAt");
  const endsAt = optionalDate(formData, "endsAt");

  if (
    (bannerId !== null && !UUID_RE.test(bannerId)) ||
    title.length < 2 ||
    desktopImage === undefined ||
    mobileImage === undefined ||
    linkUrl === undefined ||
    !STATUSES.has(status) ||
    !Number.isInteger(sortOrder) ||
    sortOrder < 0 ||
    startsAt === undefined ||
    endsAt === undefined ||
    (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt))
  ) {
    redirect("/admin/settings/banners?error=invalid_banner");
  }

  const admin = createAdminClient();
  const payload = {
    title,
    subtitle: subtitle || null,
    image_url: desktopImage,
    mobile_image_url: mobileImage,
    link_url: linkUrl,
    button_text: buttonText || null,
    status,
    sort_order: sortOrder,
    starts_at: startsAt,
    ends_at: endsAt,
  };

  if (bannerId) {
    const { data: existing } = await admin.from("banners").select("id").eq("id", bannerId).maybeSingle();
    if (!existing) redirect("/admin/settings/banners?error=banner_not_found");
    const { error } = await admin.from("banners").update(payload).eq("id", bannerId);
    if (error) redirect("/admin/settings/banners?error=banner_update_failed");
    const { error: auditError } = await admin.from("audit_logs").insert({
      actor_id: userId,
      action: "banner.updated",
      entity_type: "banner",
      entity_id: bannerId,
      metadata: { title, status, sort_order: sortOrder },
    });
    if (auditError) throw new Error("Banner audit event could not be recorded");
    revalidatePath("/");
    revalidatePath("/admin/settings/banners");
    redirect("/admin/settings/banners?message=banner_updated");
  }

  const { data: created, error } = await admin.from("banners").insert(payload).select("id").single();
  if (error || !created) redirect("/admin/settings/banners?error=banner_create_failed");
  const { error: auditError } = await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "banner.created",
    entity_type: "banner",
    entity_id: created.id,
    metadata: { title, status, sort_order: sortOrder },
  });
  if (auditError) throw new Error("Banner audit event could not be recorded");
  revalidatePath("/");
  revalidatePath("/admin/settings/banners");
  redirect("/admin/settings/banners?message=banner_created");
}
