"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9-]{1,120}$/;

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function createOrder(formData: FormData) {
  const productId = clean(formData.get("productId"), 64);
  const paymentMethodId = clean(formData.get("paymentMethodId"), 64);
  const productSlug = clean(formData.get("productSlug"), 120).toLowerCase();
  const playerId = clean(formData.get("playerId"), 120);
  const playerName = clean(formData.get("playerName"), 120);
  const customerNote = clean(formData.get("customerNote"), 500);

  const checkoutPath = SLUG_RE.test(productSlug) ? `/checkout/${productSlug}` : "/games";

  if (!UUID_RE.test(productId) || !UUID_RE.test(paymentMethodId) || !playerId) {
    redirect(`${checkoutPath}?error=invalid_input`);
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect(`/login?message=login_required`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (!profile?.is_active) {
    redirect(`${checkoutPath}?error=account_inactive`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("create_checkout_order", {
    p_user_id: userId,
    p_product_id: productId,
    p_payment_method_id: paymentMethodId,
    p_player_id: playerId,
    p_player_name: playerName,
    p_customer_note: customerNote,
  });

  const order = data?.[0];

  if (error || !order?.order_number) {
    redirect(`${checkoutPath}?error=checkout_failed`);
  }

  revalidatePath("/orders");
  revalidatePath("/account");
  redirect(`/orders/${order.order_number}?message=order_created`);
}
