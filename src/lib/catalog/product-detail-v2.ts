import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export type CatalogSuboptionV2 = {
  id: string;
  name: string;
  priceUsd: number;
  customerPrice: number;
  appliesToAllVariants: boolean;
  priceMode: "absolute" | "delta";
};

export type CatalogVariantV2 = {
  id: string;
  name: string;
  priceUsd: number;
  customerPrice: number;
  suboptionsRequired: boolean;
  suboptions: CatalogSuboptionV2[];
};

export type CatalogInputFieldV2 = {
  id: string;
  fieldKey: string;
  label: string;
  inputType: "text" | "number" | "email" | "tel";
  placeholder: string | null;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
};

export type CatalogProductDetailV2 = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: { name: string; slug: string };
  subcategory: { name: string; slug: string };
  baseSuboptionsRequired: boolean;
  baseCustomerPrice: number;
  currency: string;
  variants: CatalogVariantV2[];
  directSuboptions: CatalogSuboptionV2[];
  globalSuboptions: CatalogSuboptionV2[];
  inputFields: CatalogInputFieldV2[];
};

const SYSTEM_BASE_VARIANT_SKU = "__BASE__";

function publicClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  ) as SupabaseClient;
}

function numeric(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function customerPrice(usd: number, rate: number, margin: number) {
  return Math.round(usd * rate * (1 + margin) * 100) / 100;
}

export async function getCatalogProductDetailV2(slug: string): Promise<CatalogProductDetailV2 | null> {
  const client = publicClient();
  if (!client) return null;

  const { data: product } = await client
    .from("products")
    .select("id, name, slug, description, image_url, subcategory_id, suboptions_required, base_price_usd, profit_margin_override")
    .eq("slug", slug)
    .eq("status", "active")
    .not("subcategory_id", "is", null)
    .maybeSingle();
  if (!product?.subcategory_id) return null;

  const [subcategoryResult, variantsResult, fieldsResult, settingsResult] = await Promise.all([
    client
      .from("subcategories")
      .select("id, category_id, name, slug")
      .eq("id", product.subcategory_id)
      .eq("status", "active")
      .maybeSingle(),
    client
      .from("product_variants")
      .select("id, name, sku, price_usd, sort_order, suboptions_required")
      .eq("product_id", product.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    client
      .from("product_input_fields")
      .select("id, field_key, label, input_type, placeholder, is_required, min_length, max_length, sort_order")
      .eq("product_id", product.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    client
      .from("store_settings")
      .select("usd_to_sdg_rate, default_profit_margin, currency")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const subcategory = subcategoryResult.data;
  if (!subcategory) return null;

  const { data: category } = await client
    .from("categories")
    .select("name, slug")
    .eq("id", subcategory.category_id)
    .eq("status", "active")
    .maybeSingle();
  if (!category) return null;

  const allVariants = variantsResult.data ?? [];
  const variantIds = allVariants.map((variant) => variant.id);
  const { data: suboptionRows } = variantIds.length
    ? await client
        .from("product_suboptions")
        .select("id, variant_id, name, price_usd, sort_order, applies_to_all_variants, price_mode")
        .in("variant_id", variantIds)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
    : { data: [] };

  const suboptions = suboptionRows ?? [];
  const rate = numeric(settingsResult.data?.usd_to_sdg_rate);
  const margin = numeric(product.profit_margin_override ?? settingsResult.data?.default_profit_margin);
  const baseUsd = numeric(product.base_price_usd);
  const systemVariant = allVariants.find((variant) => variant.sku === SYSTEM_BASE_VARIANT_SKU) ?? null;
  const visibleVariants = allVariants.filter((variant) => variant.sku !== SYSTEM_BASE_VARIANT_SKU);

  const mapSuboption = (suboption: (typeof suboptions)[number]): CatalogSuboptionV2 => {
    const priceUsd = numeric(suboption.price_usd);
    return {
      id: suboption.id,
      name: suboption.name,
      priceUsd,
      customerPrice: customerPrice(priceUsd, rate, margin),
      appliesToAllVariants: Boolean(suboption.applies_to_all_variants),
      priceMode: suboption.price_mode === "delta" ? "delta" : "absolute",
    };
  };

  const directRows = systemVariant
    ? suboptions.filter((suboption) => suboption.variant_id === systemVariant.id)
    : [];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.image_url,
    category,
    subcategory: { name: subcategory.name, slug: subcategory.slug },
    baseSuboptionsRequired: Boolean(product.suboptions_required),
    baseCustomerPrice: customerPrice(baseUsd, rate, margin),
    currency: typeof settingsResult.data?.currency === "string" ? settingsResult.data.currency : "SDG",
    directSuboptions: directRows
      .filter((suboption) => !suboption.applies_to_all_variants)
      .map(mapSuboption),
    globalSuboptions: directRows
      .filter((suboption) => Boolean(suboption.applies_to_all_variants))
      .map(mapSuboption),
    variants: visibleVariants.map((variant) => {
      const priceUsd = numeric(variant.price_usd);
      return {
        id: variant.id,
        name: variant.name,
        priceUsd,
        customerPrice: customerPrice(priceUsd, rate, margin),
        suboptionsRequired: Boolean(variant.suboptions_required),
        suboptions: suboptions
          .filter((suboption) => suboption.variant_id === variant.id && !suboption.applies_to_all_variants)
          .map(mapSuboption),
      };
    }),
    inputFields: (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      fieldKey: field.field_key,
      label: field.label,
      inputType: field.input_type as CatalogInputFieldV2["inputType"],
      placeholder: field.placeholder,
      required: Boolean(field.is_required),
      minLength: field.min_length,
      maxLength: field.max_length,
    })),
  };
}
