"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

export async function updateProductSettings(formData: FormData) {
  const { userId } = await requireAdmin();
  const productId = text(formData, "productId", 64);
  const pricingMode = text(formData, "pricingMode", 16);
  const manualPrice = optionalNumber(formData, "manualPrice");
  const manualCurrency = (text(formData, "manualCurrency", 5) || "SDG").toUpperCase();
  const basePriceUsd = optionalNumber(formData, "basePriceUsd");
  const marginPercent = optionalNumber(formData, "profitMarginPercent");
  const playerIdLabel = text(formData, "playerIdLabel", 80) || "Player ID";
  const playerNameLabel = text(formData, "playerNameLabel", 80) || "اسم اللاعب";
  const playerIdRequired = formData.get("playerIdRequired") === "on";
  const playerNameRequired = formData.get("playerNameRequired") === "on";

  if (!UUID_RE.test(productId) || !["manual", "usd_auto"].includes(pricingMode)) {
    redirect("/admin/products?error=invalid_product_settings");
  }

  if (pricingMode === "manual" && (manualPrice === null || !Number.isFinite(manualPrice) || manualPrice < 0)) {
    redirect("/admin/products?error=invalid_manual_price");
  }

  if (pricingMode === "usd_auto" && (basePriceUsd === null || !Number.isFinite(basePriceUsd) || basePriceUsd < 0)) {
    redirect("/admin/products?error=invalid_usd_price");
  }

  if (marginPercent !== null && (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > 100)) {
    redirect("/admin/products?error=invalid_margin");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!existing) redirect("/admin/products?error=product_not_found");

  const common = {
    player_id_required: playerIdRequired,
    player_name_required: playerNameRequired,
    player_id_label: playerIdLabel,
    player_name_label: playerNameLabel,
  };

  const payload = pricingMode === "usd_auto"
    ? {
        ...common,
        pricing_mode: "usd_auto",
        base_price_usd: basePriceUsd,
        profit_margin_override: marginPercent === null ? null : marginPercent / 100,
        price: 0,
        currency: "SDG",
      }
    : {
        ...common,
        pricing_mode: "manual",
        base_price_usd: null,
        profit_margin_override: null,
        price: manualPrice,
        currency: manualCurrency,
      };

  const { error } = await admin.from("products").update(payload).eq("id", productId);
  if (error) {
    const code = error.message.includes("exchange_rate_not_configured") ? "exchange_rate_required" : "update_failed";
    redirect(`/admin/products?error=${code}`);
  }

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: "product.settings_updated",
    entity_type: "product",
    entity_id: productId,
    metadata: {
      pricing_mode: pricingMode,
      player_id_required: playerIdRequired,
      player_name_required: playerNameRequired,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath(`/checkout/${existing.slug}`);
  redirect("/admin/products?message=product_updated");
}
