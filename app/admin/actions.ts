"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function number(formData: FormData, key: string) {
  return Number(String(formData.get(key) ?? "").trim());
}

function refreshAdmin() {
  revalidatePath("/admin");
  revalidatePath("/games");
  revalidatePath("/");
}

export async function createGame(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name", 120);
  const slug = text(formData, "slug", 100).toLowerCase();
  const description = text(formData, "description", 1000);

  if (name.length < 2 || !SLUG_RE.test(slug)) {
    redirect("/admin?error=invalid_game");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("games").insert({
    name,
    slug,
    description: description || null,
    status: "active",
  });

  if (error) redirect("/admin?error=game_create_failed");
  refreshAdmin();
  redirect("/admin?message=game_created");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const gameId = text(formData, "gameId", 64);
  const name = text(formData, "name", 120);
  const slug = text(formData, "slug", 100).toLowerCase();
  const sku = text(formData, "sku", 80).toUpperCase();
  const description = text(formData, "description", 1000);
  const price = number(formData, "price");
  const currency = (text(formData, "currency", 5) || "SDG").toUpperCase();

  if (!UUID_RE.test(gameId) || name.length < 2 || !SLUG_RE.test(slug) || !Number.isFinite(price) || price < 0) {
    redirect("/admin?error=invalid_product");
  }

  const admin = createAdminClient();
  const { data: game } = await admin.from("games").select("id").eq("id", gameId).maybeSingle();
  if (!game) redirect("/admin?error=game_not_found");

  const { error } = await admin.from("products").insert({
    game_id: gameId,
    name,
    slug,
    sku: sku || null,
    description: description || null,
    price,
    currency,
    status: "active",
  });

  if (error) redirect("/admin?error=product_create_failed");
  refreshAdmin();
  revalidatePath(`/products/${slug}`);
  redirect("/admin?message=product_created");
}

export async function updateStoreSettings(formData: FormData) {
  const { userId } = await requireAdmin();
  const usdToSdgRate = number(formData, "usdToSdgRate");
  const profitMarginPercent = number(formData, "profitMarginPercent");

  if (
    !Number.isFinite(usdToSdgRate) || usdToSdgRate < 0 ||
    !Number.isFinite(profitMarginPercent) || profitMarginPercent < 0 || profitMarginPercent > 100
  ) {
    redirect("/admin?error=invalid_settings");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("store_settings").upsert({
    id: 1,
    usd_to_sdg_rate: usdToSdgRate,
    default_profit_margin: profitMarginPercent / 100,
    currency: "SDG",
    updated_by: userId,
    updated_at: new Date().toISOString(),
  });

  if (error) redirect("/admin?error=settings_update_failed");
  refreshAdmin();
  redirect("/admin?message=settings_updated");
}

export async function reviewPayment(formData: FormData) {
  const { userId } = await requireAdmin();
  const paymentId = text(formData, "paymentId", 64);
  const decision = text(formData, "decision", 16);
  const reason = text(formData, "reason", 500);

  if (!UUID_RE.test(paymentId) || !["confirm", "reject"].includes(decision)) {
    redirect("/admin?error=invalid_review");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_review_payment", {
    p_admin_id: userId,
    p_payment_id: paymentId,
    p_decision: decision,
    p_review_reason: reason,
  });

  const result = data?.[0];
  if (error || !result?.order_number) redirect("/admin?error=review_failed");

  revalidatePath("/admin");
  revalidatePath("/orders");
  revalidatePath(`/orders/${result.order_number}`);
  redirect(`/admin?message=payment_${decision === "confirm" ? "confirmed" : "rejected"}`);
}
