"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODE_RE = /^[A-Z0-9_-]{2,40}$/;
const STATUSES = new Set(["active", "inactive", "archived"]);

function text(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function integer(formData: FormData, key: string) {
  const value = Number.parseInt(String(formData.get(key) ?? "0"), 10);
  return Number.isFinite(value) ? value : Number.NaN;
}

function refreshCatalog(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/products");
  revalidatePath("/games");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/checkout/${slug}`);
  }
}

export async function updateGame(formData: FormData) {
  const { userId } = await requireAdmin();
  const gameId = text(formData, "gameId", 64);
  const name = text(formData, "name", 120);
  const slug = text(formData, "slug", 100).toLowerCase();
  const description = text(formData, "description", 1000);
  const status = text(formData, "status", 16);
  const sortOrder = integer(formData, "sortOrder");

  if (!UUID_RE.test(gameId) || name.length < 2 || !SLUG_RE.test(slug) || !STATUSES.has(status) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    redirect("/admin/catalog?error=invalid_game");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("games").update({
    name,
    slug,
    description: description || null,
    status: status as "active" | "inactive" | "archived",
    sort_order: sortOrder,
  }).eq("id", gameId);

  if (error) redirect("/admin/catalog?error=game_update_failed");

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "game.updated",
    entity_type: "game",
    entity_id: gameId,
    metadata: { name, slug, status, sort_order: sortOrder },
  });

  refreshCatalog();
  redirect("/admin/catalog?message=game_updated");
}

export async function updateProductCatalog(formData: FormData) {
  const { userId } = await requireAdmin();
  const productId = text(formData, "productId", 64);
  const gameId = text(formData, "gameId", 64);
  const name = text(formData, "name", 120);
  const slug = text(formData, "slug", 100).toLowerCase();
  const sku = text(formData, "sku", 80).toUpperCase();
  const description = text(formData, "description", 1000);
  const status = text(formData, "status", 16);
  const sortOrder = integer(formData, "sortOrder");

  if (!UUID_RE.test(productId) || !UUID_RE.test(gameId) || name.length < 2 || !SLUG_RE.test(slug) || !STATUSES.has(status) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    redirect("/admin/catalog?error=invalid_product");
  }

  const admin = createAdminClient();
  const [{ data: game }, { data: existing }] = await Promise.all([
    admin.from("games").select("id").eq("id", gameId).maybeSingle(),
    admin.from("products").select("id, slug").eq("id", productId).maybeSingle(),
  ]);

  if (!game || !existing) redirect("/admin/catalog?error=product_not_found");

  const { error } = await admin.from("products").update({
    game_id: gameId,
    name,
    slug,
    sku: sku || null,
    description: description || null,
    status: status as "active" | "inactive" | "archived",
    sort_order: sortOrder,
  }).eq("id", productId);

  if (error) redirect("/admin/catalog?error=product_update_failed");

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "product.catalog_updated",
    entity_type: "product",
    entity_id: productId,
    metadata: { game_id: gameId, name, slug, status, sort_order: sortOrder },
  });

  refreshCatalog(existing.slug);
  if (existing.slug !== slug) refreshCatalog(slug);
  redirect("/admin/catalog?message=product_updated");
}

export async function updatePaymentMethod(formData: FormData) {
  const { userId } = await requireAdmin();
  const methodId = text(formData, "methodId", 64);
  const name = text(formData, "name", 100);
  const code = text(formData, "code", 40).toUpperCase();
  const accountLabel = text(formData, "accountLabel", 120);
  const accountIdentifier = text(formData, "accountIdentifier", 180);
  const instructions = text(formData, "instructions", 1000);
  const status = text(formData, "status", 16);
  const sortOrder = integer(formData, "sortOrder");

  if (!UUID_RE.test(methodId) || name.length < 2 || !CODE_RE.test(code) || !accountIdentifier || !STATUSES.has(status) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    redirect("/admin/catalog?error=invalid_payment_method");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("payment_methods").update({
    name,
    code,
    account_label: accountLabel || null,
    account_identifier: accountIdentifier,
    instructions: instructions || null,
    status: status as "active" | "inactive" | "archived",
    sort_order: sortOrder,
  }).eq("id", methodId);

  if (error) redirect("/admin/catalog?error=payment_method_update_failed");

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "payment_method.updated",
    entity_type: "payment_method",
    entity_id: methodId,
    metadata: { name, code, status, sort_order: sortOrder },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/checkout/[slug]", "page");
  redirect("/admin/catalog?message=payment_method_updated");
}
