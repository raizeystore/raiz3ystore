import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

export type CatalogSearchResult = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  subcategoryName: string | null;
};

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function searchCatalogProducts(rawQuery: string): Promise<CatalogSearchResult[]> {
  const query = rawQuery.trim().toLocaleLowerCase("ar").slice(0, 80);
  if (query.length < 2) return [];

  const client = publicClient();
  if (!client) return [];

  const { data: products, error } = await client
    .from("products")
    .select("id, name, slug, description, image_url, subcategory_id")
    .not("subcategory_id", "is", null)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(100);

  if (error || !products?.length) return [];

  const subcategoryIds = Array.from(new Set(products.flatMap((product) => product.subcategory_id ? [product.subcategory_id] : [])));
  const { data: subcategories } = subcategoryIds.length
    ? await client.from("subcategories").select("id, name").in("id", subcategoryIds).eq("status", "active")
    : { data: [] as Array<{ id: string; name: string }> };
  const names = new Map((subcategories ?? []).map((subcategory) => [subcategory.id, subcategory.name]));

  return products
    .filter((product) => {
      const haystack = `${product.name} ${product.description ?? ""} ${product.subcategory_id ? names.get(product.subcategory_id) ?? "" : ""}`.toLocaleLowerCase("ar");
      return haystack.includes(query);
    })
    .slice(0, 30)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.image_url,
      subcategoryName: product.subcategory_id ? names.get(product.subcategory_id) ?? null : null,
    }));
}
