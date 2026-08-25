"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCartForUser,
  getCatalogInputFields,
  resolveCatalogSelection,
  type ResolvedCatalogSelection,
} from "@/src/lib/cart/catalog-cart";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: FormDataEntryValue | null, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function buyReturnPath(productId: string, variantId: string, suboptionId: string, quantity: number, error?: string) {
  const params = new URLSearchParams({ mode: "buy", productId, quantity: String(quantity) });
  if (variantId) params.set("variantId", variantId);
  if (suboptionId) params.set("suboptionId", suboptionId);
  if (error) params.set("error", error);
  return `/checkout/catalog?${params.toString()}`;
}

function cartReturnPath(error?: string) {
  return `/checkout/catalog?mode=cart${error ? `&error=${encodeURIComponent(error)}` : ""}`;
}

function lineKey(item: ResolvedCatalogSelection) {
  return item.cartItemId ?? "buy";
}

export async function createCatalogOrder(formData: FormData) {
  const mode = clean(formData.get("mode"), 10);
  const paymentMethodId = clean(formData.get("paymentMethodId"), 64);
  const checkoutToken = clean(formData.get("checkoutToken"), 64);
  const customerNote = clean(formData.get("customerNote"), 500);

  const buyProductId = clean(formData.get("productId"), 64);
  const buyVariantId = clean(formData.get("variantId"), 64);
  const buySuboptionId = clean(formData.get("suboptionId"), 64);
  const buyQuantity = Number(clean(formData.get("quantity"), 4) || "1");
  const returnPath = mode === "cart"
    ? cartReturnPath()
    : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity);

  if (!UUID_RE.test(paymentMethodId) || !UUID_RE.test(checkoutToken) || !["cart", "buy"].includes(mode)) {
    redirect(`${returnPath}${returnPath.includes("?") ? "&" : "?"}error=invalid_input`);
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect(`/login?next=${encodeURIComponent(returnPath)}`);

  const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", userId).maybeSingle();
  if (!profile?.is_active) redirect("/account?error=account_inactive");

  let items: ResolvedCatalogSelection[];
  if (mode === "cart") {
    items = await getCartForUser(userId);
  } else {
    if (
      !UUID_RE.test(buyProductId) ||
      (buyVariantId && !UUID_RE.test(buyVariantId)) ||
      (buySuboptionId && !UUID_RE.test(buySuboptionId)) ||
      !Number.isInteger(buyQuantity) ||
      buyQuantity < 1 ||
      buyQuantity > 100
    ) redirect(buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "invalid_selection"));

    items = [await resolveCatalogSelection({
      productId: buyProductId,
      variantId: buyVariantId || null,
      suboptionId: buySuboptionId || null,
      quantity: buyQuantity,
    })];
  }

  if (!items.length || items.some((item) => !item.available)) {
    redirect(mode === "cart" ? cartReturnPath("selection_changed") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "selection_changed"));
  }

  const fields = await getCatalogInputFields(items.map((item) => item.productId));
  const payload = items.map((item) => {
    const customerInputs: Record<string, string> = {};
    const relevantFields = fields.filter((field) => field.productId === item.productId);
    for (const field of relevantFields) {
      const value = clean(formData.get(`input_${lineKey(item)}_${field.fieldKey}`), field.maxLength ?? 500);
      if (field.required && !value) {
        redirect(mode === "cart" ? cartReturnPath("required_input") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "required_input"));
      }
      if (value && field.minLength !== null && value.length < field.minLength) {
        redirect(mode === "cart" ? cartReturnPath("invalid_input_length") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "invalid_input_length"));
      }
      if (value && field.maxLength !== null && value.length > field.maxLength) {
        redirect(mode === "cart" ? cartReturnPath("invalid_input_length") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "invalid_input_length"));
      }
      if (value && field.inputType === "email" && !EMAIL_RE.test(value)) {
        redirect(mode === "cart" ? cartReturnPath("invalid_field") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "invalid_field"));
      }
      if (value && field.inputType === "number" && !/^[-+]?\d+(?:\.\d+)?$/.test(value)) {
        redirect(mode === "cart" ? cartReturnPath("invalid_field") : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, "invalid_field"));
      }
      if (value) customerInputs[field.fieldKey] = value;
    }

    return {
      product_id: item.productId,
      variant_id: item.variantId,
      suboption_id: item.suboptionId,
      quantity: item.quantity,
      customer_inputs: customerInputs,
    };
  });

  const admin = createAdminClient() as unknown as SupabaseClient;
  const { data, error } = await admin.rpc("create_catalog_checkout_order", {
    p_user_id: userId,
    p_payment_method_id: paymentMethodId,
    p_items: payload,
    p_customer_note: customerNote,
    p_idempotency_key: checkoutToken,
  });
  const order = Array.isArray(data) ? data[0] : null;

  if (error || !order?.order_number) {
    let code = "checkout_failed";
    const message = String(error?.message ?? "");
    if (message.includes("checkout_rate_limited")) code = "rate_limited";
    else if (message.includes("suboption_required")) code = "suboption_required";
    else if (message.includes("required_input")) code = "required_input";
    else if (message.includes("selection") || message.includes("unavailable") || message.includes("mismatch")) code = "selection_changed";
    redirect(mode === "cart" ? cartReturnPath(code) : buyReturnPath(buyProductId, buyVariantId, buySuboptionId, buyQuantity, code));
  }

  if (mode === "cart") {
    await admin.from("cart_items").delete().eq("user_id", userId);
  }

  revalidatePath("/cart");
  revalidatePath("/orders");
  revalidatePath("/account");
  revalidatePath("/", "layout");
  redirect(`/orders/${order.order_number}?message=order_created`);
}
