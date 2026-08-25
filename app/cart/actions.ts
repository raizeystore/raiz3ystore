"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveCatalogSelection } from "@/src/lib/cart/catalog-cart";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: FormDataEntryValue | null, maxLength = 64) {
  return String(value ?? "").trim().slice(0, maxLength);
}

async function userId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

async function cartCount(client: SupabaseClient, id: string) {
  const { data } = await client.from("cart_items").select("quantity").eq("user_id", id);
  return (data ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
}

function refreshCart() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function addCartItem(formData: FormData) {
  const id = await userId();
  if (!id) return { ok: false as const, reason: "login_required" as const };

  const productId = clean(formData.get("productId"));
  const variantRaw = clean(formData.get("variantId"));
  const suboptionRaw = clean(formData.get("suboptionId"));
  const quantity = Number(clean(formData.get("quantity"), 4));
  const variantId = variantRaw || null;
  const suboptionId = suboptionRaw || null;

  if (
    !UUID_RE.test(productId) ||
    (variantId !== null && !UUID_RE.test(variantId)) ||
    (suboptionId !== null && !UUID_RE.test(suboptionId)) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    return { ok: false as const, reason: "invalid_selection" as const };
  }

  const resolved = await resolveCatalogSelection({ productId, variantId, suboptionId, quantity });
  if (!resolved.available) return { ok: false as const, reason: resolved.error ?? "unavailable" };

  const admin = createAdminClient() as unknown as SupabaseClient;
  let query = admin
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", id)
    .eq("product_id", productId);
  query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
  query = suboptionId ? query.eq("suboption_id", suboptionId) : query.is("suboption_id", null);
  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const nextQuantity = Math.min(100, Number(existing.quantity) + quantity);
    const { error } = await admin
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existing.id)
      .eq("user_id", id);
    if (error) return { ok: false as const, reason: "cart_update_failed" as const };
  } else {
    const { error } = await admin.from("cart_items").insert({
      user_id: id,
      product_id: productId,
      variant_id: variantId,
      suboption_id: suboptionId,
      quantity,
    });
    if (error) return { ok: false as const, reason: "cart_insert_failed" as const };
  }

  refreshCart();
  return { ok: true as const, count: await cartCount(admin, id) };
}

export async function setCartItemQuantity(formData: FormData) {
  const id = await userId();
  if (!id) return;
  const cartItemId = clean(formData.get("cartItemId"));
  const quantity = Number(clean(formData.get("quantity"), 4));
  if (!UUID_RE.test(cartItemId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return;

  const admin = createAdminClient() as unknown as SupabaseClient;
  await admin.from("cart_items").update({ quantity }).eq("id", cartItemId).eq("user_id", id);
  refreshCart();
}

export async function removeCartItem(formData: FormData) {
  const id = await userId();
  if (!id) return;
  const cartItemId = clean(formData.get("cartItemId"));
  if (!UUID_RE.test(cartItemId)) return;

  const admin = createAdminClient() as unknown as SupabaseClient;
  await admin.from("cart_items").delete().eq("id", cartItemId).eq("user_id", id);
  refreshCart();
}
