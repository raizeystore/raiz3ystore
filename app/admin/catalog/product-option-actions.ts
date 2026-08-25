"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYSTEM_BASE_VARIANT_SKU = "__BASE__";
const DIRECT_PRODUCT_VARIANT = "__product_base__";
const STATUSES = new Set(["active", "inactive", "archived"]);

function text(formData: FormData, key: string, max = 120) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function integer(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key, 20);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 1_000_000 ? value : null;
}

function decimal(formData: FormData, key: string) {
  const value = Number(text(formData, key, 32));
  return Number.isFinite(value) && value >= 0 && value <= 10_000_000 ? value : null;
}

function detailPath(productId: string) {
  return UUID_RE.test(productId) ? `/admin/catalog/products/${productId}` : "/admin/catalog/products";
}

function refresh(productId: string, slug: string) {
  revalidatePath(`/admin/catalog/products/${productId}`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/catalog/products");
  revalidatePath("/cart");
}

async function audit(
  admin: SupabaseClient,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, string | number | boolean | null>,
) {
  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
  if (error) throw new Error("Catalog option audit event could not be recorded");
}

async function systemBaseVariant(admin: SupabaseClient, product: { id: string; name: string; base_price_usd: unknown }) {
  const { data: existing } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", product.id)
    .eq("sku", SYSTEM_BASE_VARIANT_SKU)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await admin
    .from("product_variants")
    .insert({
      product_id: product.id,
      name: "المنتج الأساسي",
      sku: SYSTEM_BASE_VARIANT_SKU,
      price_usd: Number(product.base_price_usd ?? 0),
      suboptions_required: false,
      status: "active",
      sort_order: 0,
    })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

export async function saveVariantV2(formData: FormData) {
  const { userId } = await requireAdmin();
  const productId = text(formData, "productId", 64);
  const variantId = text(formData, "variantId", 64) || null;
  const name = text(formData, "name");
  const sku = text(formData, "sku", 80).toUpperCase();
  const priceUsd = decimal(formData, "priceUsd");
  const status = text(formData, "status", 16);
  const sortOrder = integer(formData, "sortOrder");
  const suboptionsRequired = formData.get("suboptionsRequired") === "on";
  const path = detailPath(productId);

  if (
    !UUID_RE.test(productId) ||
    (variantId !== null && !UUID_RE.test(variantId)) ||
    name.length < 1 ||
    priceUsd === null ||
    !STATUSES.has(status) ||
    sortOrder === null
  ) redirect(`${path}?error=invalid_variant`);

  const admin = createAdminClient() as unknown as SupabaseClient;
  const { data: product } = await admin
    .from("products")
    .select("id, slug, subcategory_id")
    .eq("id", productId)
    .maybeSingle();
  if (!product?.subcategory_id) redirect(`${path}?error=product_not_found`);

  const payload = {
    product_id: productId,
    name,
    sku: sku || null,
    price_usd: priceUsd,
    suboptions_required: suboptionsRequired,
    status,
    sort_order: sortOrder,
  };

  let savedId = variantId;
  if (variantId) {
    const { data: updated, error } = await admin
      .from("product_variants")
      .update(payload)
      .eq("id", variantId)
      .eq("product_id", productId)
      .neq("sku", SYSTEM_BASE_VARIANT_SKU)
      .select("id")
      .maybeSingle();
    if (error || !updated) redirect(`${path}?error=variant_update_failed`);
  } else {
    const { data, error } = await admin.from("product_variants").insert(payload).select("id").single();
    if (error || !data) redirect(`${path}?error=variant_create_failed`);
    savedId = data.id as string;
  }

  await audit(admin, userId, variantId ? "variant.updated" : "variant.created", "product_variant", savedId!, {
    product_id: productId,
    name,
    price_usd: priceUsd,
    suboptions_required: suboptionsRequired,
    status,
  });
  refresh(productId, product.slug as string);
  redirect(`${path}?message=variant_saved`);
}

export async function saveSuboptionV2(formData: FormData) {
  const { userId } = await requireAdmin();
  const productId = text(formData, "productId", 64);
  const suboptionId = text(formData, "suboptionId", 64) || null;
  const requestedVariantId = text(formData, "variantId", 64);
  const name = text(formData, "name");
  const priceUsd = decimal(formData, "priceUsd");
  const status = text(formData, "status", 16);
  const sortOrder = integer(formData, "sortOrder");
  const appliesToAllVariants = formData.get("applyToAllVariants") === "on";
  const path = detailPath(productId);

  if (
    !UUID_RE.test(productId) ||
    (suboptionId !== null && !UUID_RE.test(suboptionId)) ||
    (!appliesToAllVariants && requestedVariantId !== DIRECT_PRODUCT_VARIANT && !UUID_RE.test(requestedVariantId)) ||
    !name ||
    priceUsd === null ||
    !STATUSES.has(status) ||
    sortOrder === null
  ) redirect(`${path}?error=invalid_suboption`);

  const admin = createAdminClient() as unknown as SupabaseClient;
  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, subcategory_id, base_price_usd")
    .eq("id", productId)
    .maybeSingle();
  if (!product?.subcategory_id) redirect(`${path}?error=product_not_found`);

  let variantId: string | null = null;
  if (appliesToAllVariants || requestedVariantId === DIRECT_PRODUCT_VARIANT) {
    variantId = await systemBaseVariant(admin, {
      id: product.id as string,
      name: product.name as string,
      base_price_usd: product.base_price_usd,
    });
    if (!variantId) redirect(`${path}?error=base_variant_failed`);
  } else {
    const { data: variant } = await admin
      .from("product_variants")
      .select("id")
      .eq("id", requestedVariantId)
      .eq("product_id", productId)
      .neq("sku", SYSTEM_BASE_VARIANT_SKU)
      .maybeSingle();
    if (!variant) redirect(`${path}?error=variant_not_found`);
    variantId = variant.id as string;
  }

  if (suboptionId) {
    const { data: existing } = await admin
      .from("product_suboptions")
      .select("id, variant_id")
      .eq("id", suboptionId)
      .maybeSingle();
    if (!existing) redirect(`${path}?error=suboption_not_found`);

    const { data: parent } = await admin
      .from("product_variants")
      .select("product_id")
      .eq("id", existing.variant_id)
      .maybeSingle();
    if (parent?.product_id !== productId) redirect(`${path}?error=suboption_not_found`);
  }

  const payload = {
    variant_id: variantId,
    name,
    price_usd: priceUsd,
    applies_to_all_variants: appliesToAllVariants,
    price_mode: appliesToAllVariants ? "delta" : "absolute",
    status,
    sort_order: sortOrder,
  };

  let savedId = suboptionId;
  if (suboptionId) {
    const { data: updated, error } = await admin
      .from("product_suboptions")
      .update(payload)
      .eq("id", suboptionId)
      .select("id")
      .maybeSingle();
    if (error || !updated) redirect(`${path}?error=suboption_update_failed`);
  } else {
    const { data, error } = await admin.from("product_suboptions").insert(payload).select("id").single();
    if (error || !data) redirect(`${path}?error=suboption_create_failed`);
    savedId = data.id as string;
  }

  await audit(admin, userId, suboptionId ? "suboption.updated" : "suboption.created", "product_suboption", savedId!, {
    product_id: productId,
    variant_id: variantId,
    name,
    price_usd: priceUsd,
    applies_to_all_variants: appliesToAllVariants,
    price_mode: appliesToAllVariants ? "delta" : "absolute",
    status,
  });
  refresh(productId, product.slug as string);
  redirect(`${path}?message=suboption_saved`);
}
