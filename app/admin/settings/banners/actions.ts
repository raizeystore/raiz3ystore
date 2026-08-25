"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { CatalogMediaError, resolveCatalogImage } from "@/src/lib/catalog/media";
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

function optionalDate(formData: FormData, key: string) {
  const value = text(formData, key, 40);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

async function bannerImage(
  admin: ReturnType<typeof createAdminClient>,
  formData: FormData,
  fileKey: string,
  existingKey: string,
) {
  try {
    return await resolveCatalogImage(admin, formData, {
      fileKey,
      existingKey,
      folder: "banners",
    });
  } catch (error) {
    if (error instanceof CatalogMediaError) return undefined;
    throw error;
  }
}

export async function saveBanner(formData: FormData) {
  const { userId } = await requireAdmin();
  const bannerId = text(formData, "bannerId", 64) || null;
  const title = text(formData, "title", 120);
  const subtitle = text(formData, "subtitle", 240);
  const linkUrl = safeNavigationUrl(formData, "linkUrl");
  const buttonText = text(formData, "buttonText", 80);
  const status = text(formData, "status", 16) as BannerStatus;
  const sortOrder = Number(text(formData, "sortOrder", 12) || "0");
  const startsAt = optionalDate(formData, "startsAt");
  const endsAt = optionalDate(formData, "endsAt");

  if (
    (bannerId !== null && !UUID_RE.test(bannerId)) ||
    title.length < 2 ||
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
  if (bannerId) {
    const { data: existing } = await admin.from("banners").select("id").eq("id", bannerId).maybeSingle();
    if (!existing) redirect("/admin/settings/banners?error=banner_not_found");
  }

  const [desktopImage, mobileImage] = await Promise.all([
    bannerImage(admin, formData, "desktopImageFile", "desktopExistingImageUrl"),
    bannerImage(admin, formData, "mobileImageFile", "mobileExistingImageUrl"),
  ]);
  if (desktopImage === undefined || mobileImage === undefined) {
    redirect("/admin/settings/banners?error=image_invalid");
  }
  if (!desktopImage) redirect("/admin/settings/banners?error=desktop_image_required");

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
