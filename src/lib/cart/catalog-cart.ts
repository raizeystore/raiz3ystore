import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";

export type CartSelectionInput = {
  cartItemId?: string | null;
  productId: string;
  variantId?: string | null;
  suboptionId?: string | null;
  quantity: number;
};

export type ResolvedCatalogSelection = {
  cartItemId: string | null;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  suboptionId: string | null;
  suboptionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  requiresSuboption: boolean;
  available: boolean;
  error: string | null;
};

export type CatalogInputField = {
  id: string;
  productId: string;
  fieldKey: string;
  label: string;
  inputType: "text" | "number" | "email" | "tel";
  placeholder: string | null;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
  sortOrder: number;
};

type PricingSettings = {
  rate: number;
  margin: number;
  currency: string;
};

const SYSTEM_BASE_VARIANT_SKU = "__BASE__";

function numeric(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function customerPrice(usd: number, rate: number, margin: number) {
  return Math.round(usd * rate * (1 + margin) * 100) / 100;
}

function unavailable(selection: CartSelectionInput, currency: string, error: string): ResolvedCatalogSelection {
  return {
    cartItemId: selection.cartItemId ?? null,
    productId: selection.productId,
    productName: "منتج غير متاح",
    productSlug: "",
    imageUrl: null,
    variantId: selection.variantId ?? null,
    variantName: null,
    suboptionId: selection.suboptionId ?? null,
    suboptionName: null,
    quantity: selection.quantity,
    unitPrice: 0,
    totalPrice: 0,
    currency,
    requiresSuboption: false,
    available: false,
    error,
  };
}

async function readSettings(client: SupabaseClient): Promise<PricingSettings> {
  const { data } = await client
    .from("store_settings")
    .select("usd_to_sdg_rate, default_profit_margin, currency")
    .eq("id", 1)
    .maybeSingle();

  return {
    rate: numeric(data?.usd_to_sdg_rate),
    margin: numeric(data?.default_profit_margin),
    currency: typeof data?.currency === "string" ? data.currency : "SDG",
  };
}

async function resolveWith(
  client: SupabaseClient,
  settings: PricingSettings,
  selection: CartSelectionInput,
): Promise<ResolvedCatalogSelection> {
  const quantity = Number.isInteger(selection.quantity) ? selection.quantity : 0;
  if (quantity < 1 || quantity > 100) {
    return unavailable(selection, settings.currency, "invalid_quantity");
  }

  const { data: product } = await client
    .from("products")
    .select("id, name, slug, image_url, subcategory_id, base_price_usd, profit_margin_override, suboptions_required, status")
    .eq("id", selection.productId)
    .maybeSingle();

  if (!product || product.status !== "active" || !product.subcategory_id) {
    return unavailable(selection, settings.currency, "product_unavailable");
  }

  const { data: subcategory } = await client
    .from("subcategories")
    .select("category_id, status")
    .eq("id", product.subcategory_id)
    .maybeSingle();
  if (!subcategory || subcategory.status !== "active") {
    return unavailable(selection, settings.currency, "subcategory_unavailable");
  }

  const { data: category } = await client
    .from("categories")
    .select("status")
    .eq("id", subcategory.category_id)
    .maybeSingle();
  if (!category || category.status !== "active") {
    return unavailable(selection, settings.currency, "category_unavailable");
  }

  const margin = numeric(product.profit_margin_override ?? settings.margin);
  let selectedUsd = numeric(product.base_price_usd);
  let variantName: string | null = null;
  let suboptionName: string | null = null;
  let requiresSuboption = Boolean(product.suboptions_required);

  if (selection.variantId) {
    const { data: variant } = await client
      .from("product_variants")
      .select("id, name, sku, price_usd, status, suboptions_required")
      .eq("id", selection.variantId)
      .eq("product_id", product.id)
      .maybeSingle();

    if (!variant || variant.status !== "active" || variant.sku === SYSTEM_BASE_VARIANT_SKU) {
      return unavailable(selection, settings.currency, "variant_unavailable");
    }

    variantName = variant.name;
    selectedUsd = numeric(variant.price_usd);
    requiresSuboption = Boolean(variant.suboptions_required);
  }

  if (selection.suboptionId) {
    const { data: suboption } = await client
      .from("product_suboptions")
      .select("id, variant_id, name, price_usd, status, applies_to_all_variants, price_mode")
      .eq("id", selection.suboptionId)
      .maybeSingle();

    if (!suboption || suboption.status !== "active") {
      return unavailable(selection, settings.currency, "suboption_unavailable");
    }

    const { data: parentVariant } = await client
      .from("product_variants")
      .select("id, product_id, sku, status")
      .eq("id", suboption.variant_id)
      .maybeSingle();

    if (!parentVariant || parentVariant.status !== "active" || parentVariant.product_id !== product.id) {
      return unavailable(selection, settings.currency, "suboption_unavailable");
    }

    const global = Boolean(suboption.applies_to_all_variants);
    const priceMode = suboption.price_mode === "delta" ? "delta" : "absolute";

    if (global) {
      if (parentVariant.sku !== SYSTEM_BASE_VARIANT_SKU || priceMode !== "delta") {
        return unavailable(selection, settings.currency, "global_suboption_invalid");
      }
      selectedUsd += numeric(suboption.price_usd);
    } else {
      const matchesDirect = !selection.variantId && parentVariant.sku === SYSTEM_BASE_VARIANT_SKU;
      const matchesVariant = Boolean(selection.variantId) && parentVariant.id === selection.variantId;
      if (!matchesDirect && !matchesVariant) {
        return unavailable(selection, settings.currency, "suboption_mismatch");
      }
      selectedUsd = priceMode === "delta"
        ? selectedUsd + numeric(suboption.price_usd)
        : numeric(suboption.price_usd);
    }

    suboptionName = suboption.name;
  } else if (requiresSuboption) {
    return unavailable(selection, settings.currency, "suboption_required");
  }

  if (settings.rate <= 0) {
    return unavailable(selection, settings.currency, "exchange_rate_unavailable");
  }

  const unitPrice = customerPrice(selectedUsd, settings.rate, margin);
  return {
    cartItemId: selection.cartItemId ?? null,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    imageUrl: product.image_url,
    variantId: selection.variantId ?? null,
    variantName,
    suboptionId: selection.suboptionId ?? null,
    suboptionName,
    quantity,
    unitPrice,
    totalPrice: Math.round(unitPrice * quantity * 100) / 100,
    currency: settings.currency,
    requiresSuboption,
    available: true,
    error: null,
  };
}

export async function resolveCatalogSelection(
  selection: CartSelectionInput,
): Promise<ResolvedCatalogSelection> {
  const client = createAdminClient() as unknown as SupabaseClient;
  const settings = await readSettings(client);
  return resolveWith(client, settings, selection);
}

export async function getCartForUser(userId: string): Promise<ResolvedCatalogSelection[]> {
  const client = createAdminClient() as unknown as SupabaseClient;
  const [{ data: rows }, settings] = await Promise.all([
    client
      .from("cart_items")
      .select("id, product_id, variant_id, suboption_id, quantity, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    readSettings(client),
  ]);

  return Promise.all(
    (rows ?? []).map((row) => resolveWith(client, settings, {
      cartItemId: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      suboptionId: row.suboption_id,
      quantity: Number(row.quantity),
    })),
  );
}

export async function getCatalogInputFields(productIds: string[]): Promise<CatalogInputField[]> {
  const ids = [...new Set(productIds)].filter(Boolean);
  if (!ids.length) return [];

  const client = createAdminClient() as unknown as SupabaseClient;
  const { data } = await client
    .from("product_input_fields")
    .select("id, product_id, field_key, label, input_type, placeholder, is_required, min_length, max_length, sort_order")
    .in("product_id", ids)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  return (data ?? []).map((field) => ({
    id: field.id,
    productId: field.product_id,
    fieldKey: field.field_key,
    label: field.label,
    inputType: field.input_type as CatalogInputField["inputType"],
    placeholder: field.placeholder,
    required: Boolean(field.is_required),
    minLength: field.min_length,
    maxLength: field.max_length,
    sortOrder: Number(field.sort_order ?? 0),
  }));
}
