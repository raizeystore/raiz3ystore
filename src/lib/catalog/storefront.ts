import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database } from "@/src/types/database";

type ProductStatus = Database["public"]["Enums"]["product_status"];

export type StorefrontBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  desktopImage: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  buttonText: string | null;
};

export type StorefrontSubcategory = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  subcategories: StorefrontSubcategory[];
};

export type StorefrontProductCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  startingPriceUsd: number | null;
};

export type StorefrontVariant = {
  id: string;
  name: string;
  priceUsd: number;
  customerPrice: number;
  suboptions: StorefrontSuboption[];
};

export type StorefrontSuboption = {
  id: string;
  name: string;
  priceUsd: number;
  customerPrice: number;
};

export type StorefrontInputField = {
  id: string;
  fieldKey: string;
  label: string;
  inputType: "text" | "number" | "email" | "tel";
  placeholder: string | null;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
};

export type StorefrontProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: { name: string; slug: string };
  subcategory: { name: string; slug: string };
  suboptionsRequired: boolean;
  baseCustomerPrice: number;
  currency: string;
  variants: StorefrontVariant[];
  directSuboptions: StorefrontSuboption[];
  inputFields: StorefrontInputField[];
};

const ACTIVE: ProductStatus = "active";
const SYSTEM_BASE_VARIANT_SKU = "__BASE__";

function hasPublicSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function publicCatalogClient() {
  if (!hasPublicSupabaseConfig()) return null;

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function customerPrice(usd: number, rate: number, margin: number) {
  return Math.round(usd * rate * (1 + margin) * 100) / 100;
}

export async function getStorefrontHome() {
  const client = publicCatalogClient();
  if (!client) {
    return {
      banners: [] as StorefrontBanner[],
      categories: [] as StorefrontCategory[],
      popularProducts: [] as StorefrontProductCard[],
    };
  }

  const [bannersResult, categoriesResult, subcategoriesResult, popularProducts] = await Promise.all([
    client
      .from("banners")
      .select("id, title, subtitle, image_url, mobile_image_url, link_url, button_text, sort_order")
      .eq("status", ACTIVE)
      .order("sort_order", { ascending: true })
      .limit(6),
    client
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order")
      .eq("status", ACTIVE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    client
      .from("subcategories")
      .select("id, category_id, name, slug, description, image_url, sort_order")
      .eq("status", ACTIVE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    getPopularProducts(),
  ]);

  const subcategories = (subcategoriesResult.data ?? []).map((subcategory) => ({
    id: subcategory.id,
    categoryId: subcategory.category_id,
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description,
    imageUrl: subcategory.image_url,
  }));

  const categories = (categoriesResult.data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.image_url,
    subcategories: subcategories.filter(
      (subcategory) => subcategory.categoryId === category.id,
    ),
  }));

  const banners = (bannersResult.data ?? []).map((banner) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    desktopImage: banner.image_url,
    mobileImage: banner.mobile_image_url,
    linkUrl: banner.link_url,
    buttonText: banner.button_text,
  }));

  return { banners, categories, popularProducts };
}

async function getPopularProducts(): Promise<StorefrontProductCard[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    return [];
  }

  const admin = createAdminClient();
  const { data: ranking, error } = await admin.rpc("get_popular_products_server", { p_limit: 8 });
  if (error || !ranking?.length) return [];

  const ids = ranking.map((row) => row.product_id);
  const [{ data: products }, { data: variants }, { data: subcategories }] = await Promise.all([
    admin
      .from("products")
      .select("id, name, slug, description, image_url, subcategory_id, base_price_usd, status")
      .in("id", ids)
      .eq("status", ACTIVE),
    admin
      .from("product_variants")
      .select("product_id, price_usd, status, sku")
      .in("product_id", ids)
      .eq("status", ACTIVE),
    admin.from("subcategories").select("id, name, status").eq("status", ACTIVE),
  ]);

  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  const subcategoryNames = new Map((subcategories ?? []).map((subcategory) => [subcategory.id, subcategory.name]));

  return ranking.flatMap((rank) => {
    const product = byId.get(rank.product_id);
    if (!product) return [];

    const variantPrices = (variants ?? [])
      .filter((variant) => variant.product_id === product.id && variant.sku !== SYSTEM_BASE_VARIANT_SKU)
      .map((variant) => numberValue(variant.price_usd))
      .filter((value): value is number => value !== null);
    const basePrice = numberValue(product.base_price_usd);

    return [{
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.image_url,
      subcategoryId: product.subcategory_id,
      subcategoryName: product.subcategory_id ? (subcategoryNames.get(product.subcategory_id) ?? null) : null,
      startingPriceUsd: variantPrices.length ? Math.min(...variantPrices) : basePrice,
    }];
  });
}

export async function getCategoryBySlug(slug: string) {
  const client = publicCatalogClient();
  if (!client) return null;

  const { data: category } = await client
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .eq("status", ACTIVE)
    .maybeSingle();
  if (!category) return null;

  const { data: subcategories } = await client
    .from("subcategories")
    .select("id, category_id, name, slug, description, image_url, sort_order")
    .eq("category_id", category.id)
    .eq("status", ACTIVE)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.image_url,
    subcategories: (subcategories ?? []).map((subcategory) => ({
      id: subcategory.id,
      categoryId: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description,
      imageUrl: subcategory.image_url,
    })),
  } satisfies StorefrontCategory;
}

export async function getSubcategoryBySlug(slug: string) {
  const client = publicCatalogClient();
  if (!client) return null;

  const { data: subcategory } = await client
    .from("subcategories")
    .select("id, category_id, name, slug, description, image_url")
    .eq("slug", slug)
    .eq("status", ACTIVE)
    .maybeSingle();
  if (!subcategory) return null;

  const [{ data: category }, { data: products }] = await Promise.all([
    client.from("categories").select("name, slug").eq("id", subcategory.category_id).eq("status", ACTIVE).maybeSingle(),
    client
      .from("products")
      .select("id, name, slug, description, image_url, subcategory_id, base_price_usd, sort_order")
      .eq("subcategory_id", subcategory.id)
      .eq("status", ACTIVE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);
  if (!category) return null;

  const productIds = (products ?? []).map((product) => product.id);
  const variants = productIds.length
    ? (await client
        .from("product_variants")
        .select("product_id, price_usd, sku")
        .in("product_id", productIds)
        .eq("status", ACTIVE)).data ?? []
    : [];

  const productCards: StorefrontProductCard[] = (products ?? []).map((product) => {
    const variantPrices = variants
      .filter((variant) => variant.product_id === product.id && variant.sku !== SYSTEM_BASE_VARIANT_SKU)
      .map((variant) => numberValue(variant.price_usd))
      .filter((value): value is number => value !== null);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.image_url,
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
      startingPriceUsd: variantPrices.length ? Math.min(...variantPrices) : numberValue(product.base_price_usd),
    };
  });

  return {
    category,
    subcategory: {
      id: subcategory.id,
      categoryId: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description,
      imageUrl: subcategory.image_url,
    } satisfies StorefrontSubcategory,
    products: productCards,
  };
}

export async function getCatalogProductBySlug(slug: string): Promise<StorefrontProductDetail | null> {
  const client = publicCatalogClient();
  if (!client) return null;

  const { data: product } = await client
    .from("products")
    .select("id, name, slug, description, image_url, subcategory_id, suboptions_required, base_price_usd, profit_margin_override")
    .eq("slug", slug)
    .eq("status", ACTIVE)
    .not("subcategory_id", "is", null)
    .maybeSingle();
  if (!product?.subcategory_id) return null;

  const [subcategoryResult, variantsResult, fieldsResult, settingsResult] = await Promise.all([
    client
      .from("subcategories")
      .select("id, category_id, name, slug")
      .eq("id", product.subcategory_id)
      .eq("status", ACTIVE)
      .maybeSingle(),
    client
      .from("product_variants")
      .select("id, name, sku, price_usd, sort_order")
      .eq("product_id", product.id)
      .eq("status", ACTIVE)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    client
      .from("product_input_fields")
      .select("id, field_key, label, input_type, placeholder, is_required, min_length, max_length, sort_order")
      .eq("product_id", product.id)
      .eq("status", ACTIVE)
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
    .eq("status", ACTIVE)
    .maybeSingle();
  if (!category) return null;

  const allVariants = variantsResult.data ?? [];
  const variantIds = allVariants.map((variant) => variant.id);
  const suboptions = variantIds.length
    ? (await client
        .from("product_suboptions")
        .select("id, variant_id, name, price_usd, sort_order")
        .in("variant_id", variantIds)
        .eq("status", ACTIVE)
        .order("sort_order", { ascending: true })).data ?? []
    : [];

  const rate = numberValue(settingsResult.data?.usd_to_sdg_rate) ?? 0;
  const margin = numberValue(product.profit_margin_override) ?? numberValue(settingsResult.data?.default_profit_margin) ?? 0;
  const baseUsd = numberValue(product.base_price_usd) ?? 0;
  const systemVariant = allVariants.find((variant) => variant.sku === SYSTEM_BASE_VARIANT_SKU) ?? null;
  const visibleVariants = allVariants.filter((variant) => variant.sku !== SYSTEM_BASE_VARIANT_SKU);

  const mapSuboption = (suboption: (typeof suboptions)[number]): StorefrontSuboption => {
    const suboptionUsd = numberValue(suboption.price_usd) ?? 0;
    return {
      id: suboption.id,
      name: suboption.name,
      priceUsd: suboptionUsd,
      customerPrice: customerPrice(suboptionUsd, rate, margin),
    };
  };

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.image_url,
    category,
    subcategory: { name: subcategory.name, slug: subcategory.slug },
    suboptionsRequired: product.suboptions_required,
    baseCustomerPrice: customerPrice(baseUsd, rate, margin),
    currency: settingsResult.data?.currency ?? "SDG",
    directSuboptions: systemVariant
      ? suboptions.filter((suboption) => suboption.variant_id === systemVariant.id).map(mapSuboption)
      : [],
    variants: visibleVariants.map((variant) => {
      const priceUsd = numberValue(variant.price_usd) ?? 0;
      return {
        id: variant.id,
        name: variant.name,
        priceUsd,
        customerPrice: customerPrice(priceUsd, rate, margin),
        suboptions: suboptions.filter((suboption) => suboption.variant_id === variant.id).map(mapSuboption),
      };
    }),
    inputFields: (fieldsResult.data ?? []).map((field) => ({
      id: field.id,
      fieldKey: field.field_key,
      label: field.label,
      inputType: field.input_type as StorefrontInputField["inputType"],
      placeholder: field.placeholder,
      required: field.is_required,
      minLength: field.min_length,
      maxLength: field.max_length,
    })),
  };
}
