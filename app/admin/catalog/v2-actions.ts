"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { CatalogMediaError, resolveCatalogImage } from "@/src/lib/catalog/media";
import { createAdminClient } from "@/src/lib/supabase/admin";
import type { Database, Json } from "@/src/types/database";

type CatalogStatus = Database["public"]["Enums"]["product_status"];
type MediaFolder = "categories" | "subcategories" | "products" | "banners";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FIELD_KEY_RE = /^[a-z][a-z0-9_]{0,39}$/;
const STATUSES = new Set<CatalogStatus>(["active", "inactive", "archived"]);
const INPUT_TYPES = new Set(["text", "number", "email", "tel"]);
const SYSTEM_BASE_VARIANT_SKU = "__BASE__";
const DIRECT_PRODUCT_VARIANT = "__product_base__";

const ARABIC_SLUG_MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "a", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", ة: "h",
  و: "w", ؤ: "w", ي: "y", ى: "a", ئ: "y", ء: "a",
};

function text(formData: FormData, key: string, maxLength: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maxLength);
}

function optionalId(formData: FormData, key: string) {
  const value = text(formData, key, 64);
  return value || null;
}

function status(formData: FormData) {
  const value = text(formData, "status", 16) as CatalogStatus;
  return STATUSES.has(value) ? value : null;
}

function integer(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key, 20);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 1_000_000 ? value : null;
}

function decimal(formData: FormData, key: string) {
  const raw = text(formData, key, 32);
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 10_000_000 ? value : null;
}

function optionalLength(formData: FormData, key: string) {
  const raw = text(formData, key, 8);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 500 ? value : -1;
}

function autoSlug(name: string) {
  const transliterated = Array.from(name.toLowerCase())
    .map((character) => ARABIC_SLUG_MAP[character] ?? character)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  const base = transliterated || "item";
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

function resolvedSlug(formData: FormData, name: string, current?: string | null) {
  const submitted = text(formData, "slug", 100).toLowerCase();
  if (submitted && SLUG_RE.test(submitted)) return submitted;
  if (current && SLUG_RE.test(current)) return current;
  return autoSlug(name);
}

function resolvedFieldKey(formData: FormData, current?: string | null) {
  const submitted = text(formData, "fieldKey", 40).toLowerCase();
  if (submitted && FIELD_KEY_RE.test(submitted)) return submitted;
  if (current && FIELD_KEY_RE.test(current)) return current;
  return `field_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function imageValue(
  admin: ReturnType<typeof createAdminClient>,
  formData: FormData,
  folder: MediaFolder,
) {
  try {
    return await resolveCatalogImage(admin, formData, {
      fileKey: "imageFile",
      existingKey: "existingImageUrl",
      folder,
    });
  } catch (error) {
    if (error instanceof CatalogMediaError) return undefined;
    throw error;
  }
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/catalog/categories");
  revalidatePath("/admin/catalog/subcategories");
  revalidatePath("/admin/catalog/products");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/catalog/[slug]", "page");
  if (slug) revalidatePath(`/products/${slug}`);
}

async function audit(
  admin: ReturnType<typeof createAdminClient>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Json,
) {
  const { error } = await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
  if (error) throw new Error("Catalog audit event could not be recorded");
}

export async function saveCategory(formData: FormData) {
  const { userId } = await requireAdmin();
  const categoryId = optionalId(formData, "categoryId");
  const name = text(formData, "name", 120);
  const description = text(formData, "description", 1200);
  const categoryStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");

  if ((categoryId !== null && !UUID_RE.test(categoryId)) || name.length < 2 || !categoryStatus || sortOrder === null) {
    redirect("/admin/catalog/categories?error=invalid_category");
  }

  const admin = createAdminClient();
  const { data: existing } = categoryId
    ? await admin.from("categories").select("id, slug").eq("id", categoryId).maybeSingle()
    : { data: null };
  if (categoryId && !existing) redirect("/admin/catalog/categories?error=category_not_found");

  const imageUrl = await imageValue(admin, formData, "categories");
  if (imageUrl === undefined) redirect("/admin/catalog/categories?error=image_invalid");
  const slug = resolvedSlug(formData, name, existing?.slug);
  const payload = {
    name,
    slug,
    description: description || null,
    image_url: imageUrl,
    status: categoryStatus,
    sort_order: sortOrder,
  };

  if (categoryId) {
    const { error } = await admin.from("categories").update(payload).eq("id", categoryId);
    if (error) redirect("/admin/catalog/categories?error=category_update_failed");
    await audit(admin, userId, "category.updated", "category", categoryId, payload);
    revalidateCatalog();
    redirect("/admin/catalog/categories?message=category_updated");
  }

  const { data: created, error } = await admin.from("categories").insert(payload).select("id").single();
  if (error || !created) redirect("/admin/catalog/categories?error=category_create_failed");
  await audit(admin, userId, "category.created", "category", created.id, payload);
  revalidateCatalog();
  redirect("/admin/catalog/categories?message=category_created");
}

export async function saveSubcategory(formData: FormData) {
  const { userId } = await requireAdmin();
  const subcategoryId = optionalId(formData, "subcategoryId");
  const categoryId = text(formData, "categoryId", 64);
  const name = text(formData, "name", 120);
  const description = text(formData, "description", 1200);
  const subcategoryStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");

  if (
    (subcategoryId !== null && !UUID_RE.test(subcategoryId)) ||
    !UUID_RE.test(categoryId) ||
    name.length < 2 ||
    !subcategoryStatus ||
    sortOrder === null
  ) {
    redirect("/admin/catalog/subcategories?error=invalid_subcategory");
  }

  const admin = createAdminClient();
  const [{ data: category }, existingResult] = await Promise.all([
    admin.from("categories").select("id").eq("id", categoryId).maybeSingle(),
    subcategoryId
      ? admin.from("subcategories").select("id, slug").eq("id", subcategoryId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (!category) redirect("/admin/catalog/subcategories?error=category_not_found");
  if (subcategoryId && !existingResult.data) redirect("/admin/catalog/subcategories?error=subcategory_not_found");

  const imageUrl = await imageValue(admin, formData, "subcategories");
  if (imageUrl === undefined) redirect("/admin/catalog/subcategories?error=image_invalid");
  const slug = resolvedSlug(formData, name, existingResult.data?.slug);
  const payload = {
    category_id: categoryId,
    name,
    slug,
    description: description || null,
    image_url: imageUrl,
    status: subcategoryStatus,
    sort_order: sortOrder,
  };

  if (subcategoryId) {
    const { error } = await admin.from("subcategories").update(payload).eq("id", subcategoryId);
    if (error) redirect("/admin/catalog/subcategories?error=subcategory_update_failed");
    await audit(admin, userId, "subcategory.updated", "subcategory", subcategoryId, payload);
    revalidateCatalog();
    redirect("/admin/catalog/subcategories?message=subcategory_updated");
  }

  const { data: created, error } = await admin.from("subcategories").insert(payload).select("id").single();
  if (error || !created) redirect("/admin/catalog/subcategories?error=subcategory_create_failed");
  await audit(admin, userId, "subcategory.created", "subcategory", created.id, payload);
  revalidateCatalog();
  redirect("/admin/catalog/subcategories?message=subcategory_created");
}

export async function saveCatalogProduct(formData: FormData) {
  const { userId } = await requireAdmin();
  const productId = optionalId(formData, "productId");
  const subcategoryId = text(formData, "subcategoryId", 64);
  const name = text(formData, "name", 120);
  const sku = text(formData, "sku", 80).toUpperCase();
  const description = text(formData, "description", 1200);
  const productStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");
  const basePriceUsd = decimal(formData, "basePriceUsd");
  const suboptionsRequired = formData.get("suboptionsRequired") === "on";

  if (
    (productId !== null && !UUID_RE.test(productId)) ||
    !UUID_RE.test(subcategoryId) ||
    name.length < 2 ||
    !productStatus ||
    sortOrder === null ||
    basePriceUsd === null
  ) {
    redirect("/admin/catalog/products?error=invalid_product");
  }

  const admin = createAdminClient();
  const [subcategoryResult, settingsResult, existingResult] = await Promise.all([
    admin.from("subcategories").select("id").eq("id", subcategoryId).maybeSingle(),
    admin.from("store_settings").select("usd_to_sdg_rate, currency").eq("id", 1).maybeSingle(),
    productId
      ? admin.from("products").select("id, slug, subcategory_id, sku").eq("id", productId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (!subcategoryResult.data) redirect("/admin/catalog/products?error=subcategory_not_found");
  if (!settingsResult.data || Number(settingsResult.data.usd_to_sdg_rate) <= 0) {
    redirect("/admin/catalog/products?error=exchange_rate_required");
  }
  if (productId && !existingResult.data?.subcategory_id) redirect("/admin/catalog/products?error=product_not_found");

  const imageUrl = await imageValue(admin, formData, "products");
  if (imageUrl === undefined) redirect("/admin/catalog/products?error=image_invalid");
  const slug = resolvedSlug(formData, name, existingResult.data?.slug);
  const payload = {
    game_id: null,
    subcategory_id: subcategoryId,
    name,
    slug,
    sku: sku || existingResult.data?.sku || null,
    description: description || null,
    image_url: imageUrl,
    status: productStatus,
    sort_order: sortOrder,
    suboptions_required: suboptionsRequired,
    pricing_mode: "usd_auto",
    base_price_usd: basePriceUsd,
    price: 0,
    currency: settingsResult.data.currency,
  };

  if (productId) {
    const { error } = await admin.from("products").update(payload).eq("id", productId);
    if (error) redirect("/admin/catalog/products?error=product_update_failed");
    await audit(admin, userId, "catalog_product.updated", "product", productId, {
      subcategory_id: subcategoryId,
      name,
      slug,
      status: productStatus,
      suboptions_required: suboptionsRequired,
      base_price_usd: basePriceUsd,
    });
    revalidateCatalog(existingResult.data!.slug);
    if (existingResult.data!.slug !== slug) revalidateCatalog(slug);
    redirect("/admin/catalog/products?message=product_updated");
  }

  const { data: created, error } = await admin.from("products").insert(payload).select("id").single();
  if (error || !created) redirect("/admin/catalog/products?error=product_create_failed");
  await audit(admin, userId, "catalog_product.created", "product", created.id, {
    subcategory_id: subcategoryId,
    name,
    slug,
    status: productStatus,
    suboptions_required: suboptionsRequired,
    base_price_usd: basePriceUsd,
  });
  revalidateCatalog(slug);
  redirect("/admin/catalog/products?message=product_created");
}

export async function saveVariant(formData: FormData) {
  const { userId } = await requireAdmin();
  const variantId = optionalId(formData, "variantId");
  const productId = text(formData, "productId", 64);
  const name = text(formData, "name", 120);
  const sku = text(formData, "sku", 80).toUpperCase();
  const priceUsd = decimal(formData, "priceUsd");
  const variantStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");
  const detailPath = UUID_RE.test(productId) ? `/admin/catalog/products/${productId}` : "/admin/catalog/products";

  if (
    (variantId !== null && !UUID_RE.test(variantId)) ||
    !UUID_RE.test(productId) ||
    !name ||
    priceUsd === null ||
    !variantStatus ||
    sortOrder === null
  ) {
    redirect(`${detailPath}?error=invalid_variant`);
  }

  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("id, slug, subcategory_id").eq("id", productId).maybeSingle();
  if (!product?.subcategory_id) redirect(`${detailPath}?error=product_not_found`);

  const payload = {
    product_id: productId,
    name,
    sku: sku || null,
    price_usd: priceUsd,
    status: variantStatus,
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
    if (error || !updated) redirect(`${detailPath}?error=variant_update_failed`);
  } else {
    const { data, error } = await admin.from("product_variants").insert(payload).select("id").single();
    if (error || !data) redirect(`${detailPath}?error=variant_create_failed`);
    savedId = data.id;
  }

  await audit(admin, userId, variantId ? "variant.updated" : "variant.created", "product_variant", savedId!, {
    product_id: productId,
    name,
    price_usd: priceUsd,
    status: variantStatus,
  });
  revalidateCatalog(product.slug);
  revalidatePath(detailPath);
  redirect(`${detailPath}?message=variant_saved`);
}

export async function saveSuboption(formData: FormData) {
  const { userId } = await requireAdmin();
  const suboptionId = optionalId(formData, "suboptionId");
  const requestedVariantId = text(formData, "variantId", 64);
  const productId = text(formData, "productId", 64);
  const name = text(formData, "name", 120);
  const priceUsd = decimal(formData, "priceUsd");
  const suboptionStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");
  const detailPath = UUID_RE.test(productId) ? `/admin/catalog/products/${productId}` : "/admin/catalog/products";

  if (
    (suboptionId !== null && !UUID_RE.test(suboptionId)) ||
    !UUID_RE.test(productId) ||
    (requestedVariantId !== DIRECT_PRODUCT_VARIANT && !UUID_RE.test(requestedVariantId)) ||
    !name ||
    priceUsd === null ||
    !suboptionStatus ||
    sortOrder === null
  ) {
    redirect(`${detailPath}?error=invalid_suboption`);
  }

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, subcategory_id, base_price_usd")
    .eq("id", productId)
    .maybeSingle();
  if (!product?.subcategory_id) redirect(`${detailPath}?error=product_not_found`);

  let variantId = requestedVariantId;
  if (requestedVariantId === DIRECT_PRODUCT_VARIANT) {
    const { data: systemVariant } = await admin
      .from("product_variants")
      .select("id")
      .eq("product_id", productId)
      .eq("sku", SYSTEM_BASE_VARIANT_SKU)
      .maybeSingle();

    if (systemVariant) {
      variantId = systemVariant.id;
    } else {
      const { data: createdVariant, error: variantError } = await admin
        .from("product_variants")
        .insert({
          product_id: productId,
          name: "المنتج الأساسي",
          sku: SYSTEM_BASE_VARIANT_SKU,
          price_usd: Number(product.base_price_usd ?? 0),
          status: "active",
          sort_order: 0,
        })
        .select("id")
        .single();
      if (variantError || !createdVariant) redirect(`${detailPath}?error=base_variant_failed`);
      variantId = createdVariant.id;
    }
  } else {
    const { data: variant } = await admin
      .from("product_variants")
      .select("id")
      .eq("id", requestedVariantId)
      .eq("product_id", productId)
      .maybeSingle();
    if (!variant) redirect(`${detailPath}?error=variant_not_found`);
  }

  const payload = {
    variant_id: variantId,
    name,
    price_usd: priceUsd,
    status: suboptionStatus,
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
    if (error || !updated) redirect(`${detailPath}?error=suboption_update_failed`);
  } else {
    const { data, error } = await admin.from("product_suboptions").insert(payload).select("id").single();
    if (error || !data) redirect(`${detailPath}?error=suboption_create_failed`);
    savedId = data.id;
  }

  await audit(admin, userId, suboptionId ? "suboption.updated" : "suboption.created", "product_suboption", savedId!, {
    variant_id: variantId,
    name,
    price_usd: priceUsd,
    status: suboptionStatus,
  });
  revalidateCatalog(product.slug);
  revalidatePath(detailPath);
  redirect(`${detailPath}?message=suboption_saved`);
}

export async function saveInputField(formData: FormData) {
  const { userId } = await requireAdmin();
  const fieldId = optionalId(formData, "fieldId");
  const productId = text(formData, "productId", 64);
  const label = text(formData, "label", 80);
  const inputType = text(formData, "inputType", 12);
  const placeholder = text(formData, "placeholder", 120);
  const isRequired = formData.get("isRequired") === "on";
  const minLength = optionalLength(formData, "minLength");
  const maxLength = optionalLength(formData, "maxLength");
  const fieldStatus = status(formData);
  const sortOrder = integer(formData, "sortOrder");
  const detailPath = UUID_RE.test(productId) ? `/admin/catalog/products/${productId}` : "/admin/catalog/products";

  if (
    (fieldId !== null && !UUID_RE.test(fieldId)) ||
    !UUID_RE.test(productId) ||
    !label ||
    !INPUT_TYPES.has(inputType) ||
    minLength === -1 ||
    maxLength === -1 ||
    (minLength !== null && maxLength !== null && minLength > maxLength) ||
    !fieldStatus ||
    sortOrder === null
  ) {
    redirect(`${detailPath}?error=invalid_input_field`);
  }

  const admin = createAdminClient();
  const [{ data: product }, existingResult] = await Promise.all([
    admin.from("products").select("id, slug, subcategory_id").eq("id", productId).maybeSingle(),
    fieldId
      ? admin.from("product_input_fields").select("id, field_key").eq("id", fieldId).eq("product_id", productId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (!product?.subcategory_id) redirect(`${detailPath}?error=product_not_found`);
  if (fieldId && !existingResult.data) redirect(`${detailPath}?error=input_field_not_found`);

  const fieldKey = resolvedFieldKey(formData, existingResult.data?.field_key);
  const payload = {
    product_id: productId,
    field_key: fieldKey,
    label,
    input_type: inputType,
    placeholder: placeholder || null,
    is_required: isRequired,
    min_length: minLength,
    max_length: maxLength,
    status: fieldStatus,
    sort_order: sortOrder,
  };
  let savedId = fieldId;

  if (fieldId) {
    const { data: updated, error } = await admin
      .from("product_input_fields")
      .update(payload)
      .eq("id", fieldId)
      .eq("product_id", productId)
      .select("id")
      .maybeSingle();
    if (error || !updated) redirect(`${detailPath}?error=input_field_update_failed`);
  } else {
    const { data, error } = await admin.from("product_input_fields").insert(payload).select("id").single();
    if (error || !data) redirect(`${detailPath}?error=input_field_create_failed`);
    savedId = data.id;
  }

  await audit(admin, userId, fieldId ? "input_field.updated" : "input_field.created", "product_input_field", savedId!, {
    product_id: productId,
    field_key: fieldKey,
    input_type: inputType,
    is_required: isRequired,
    status: fieldStatus,
  });
  revalidateCatalog(product.slug);
  revalidatePath(detailPath);
  redirect(`${detailPath}?message=input_field_saved`);
}
