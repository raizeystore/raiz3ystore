import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("catalog migration keeps the official normalized hierarchy and legacy rollback path", () => {
  const migration = read("supabase/migrations/20260824214439_add_catalog_v2.sql");
  const exclusivityMigration = read("supabase/migrations/20260824225440_enforce_catalog_product_parent_exclusivity.sql");

  assert.match(migration, /create table public\.categories/);
  assert.match(migration, /create table public\.subcategories/);
  assert.match(migration, /category_id uuid not null references public\.categories/);
  assert.match(migration, /subcategory_id uuid references public\.subcategories/);
  assert.match(migration, /create table public\.product_variants/);
  assert.match(migration, /create table public\.product_suboptions/);
  assert.match(migration, /create table public\.product_input_fields/);
  assert.match(migration, /game_id drop not null/);
  assert.doesNotMatch(migration, /drop table public\.games/);
  assert.doesNotMatch(migration, /drop column game_id/);
  assert.match(exclusivityMigration, /products_catalog_single_parent_check/);
  assert.match(exclusivityMigration, /\(game_id is null\) <> \(subcategory_id is null\)/);
});

test("catalog public reads require an active ancestry chain", () => {
  const migration = read("supabase/migrations/20260824222247_harden_catalog_v2_read_paths.sql");
  assert.match(migration, /products_public_read_active/);
  assert.match(migration, /join public\.categories c on c\.id = s\.category_id/);
  assert.match(migration, /s\.status = 'active'/);
  assert.match(migration, /c\.status = 'active'/);
  assert.match(migration, /product_suboptions_public_read_active/);
  assert.match(migration, /product_input_fields_public_read_active/);
  assert.match(migration, /button_text/);
});

test("most-purchased aggregation is completed-order only and server-role only", () => {
  const migration = read("supabase/migrations/20260824222446_add_server_only_completed_sales_popularity.sql");
  const storefront = read("src/lib/catalog/storefront.ts");
  const homepage = read("app/page.tsx");

  assert.match(migration, /o\.status = 'completed'/);
  assert.match(migration, /revoke all[\s\S]*public, anon, authenticated/);
  assert.match(migration, /grant execute[\s\S]*service_role/);
  assert.match(storefront, /get_popular_products_server/);
  assert.match(storefront, /SUPABASE_SECRET_KEY/);
  assert.match(homepage, /popularProducts\.length > 0/);
  assert.doesNotMatch(homepage, /PUBG MOBILE|FREE FIRE|CALL OF DUTY/);
});

test("base admin catalog mutations still verify admin sessions and parent relationships", () => {
  const actions = read("app/admin/catalog/v2-actions.ts");
  for (const action of ["saveCategory", "saveSubcategory", "saveCatalogProduct", "saveInputField"]) {
    assert.match(actions, new RegExp(`function ${action}\\([\\s\\S]*?requireAdmin\\(\\)`));
  }
  assert.match(actions, /from\("categories"\)[\s\S]*eq\("id", categoryId\)/);
  assert.match(actions, /from\("subcategories"\)[\s\S]*eq\("id", subcategoryId\)/);
  assert.match(actions, /Catalog audit event could not be recorded/);
});

test("phase 2b supports per-variant requirements and global child choices", () => {
  const migration = read("supabase/migrations/20260825135000_catalog_cart_checkout.sql");
  const actions = read("app/admin/catalog/product-option-actions.ts");
  const detail = read("app/admin/catalog/products/[id]/page.tsx");
  const reader = read("src/lib/catalog/product-detail-v2.ts");

  assert.match(migration, /alter table public\.product_variants[\s\S]*suboptions_required boolean/);
  assert.match(migration, /applies_to_all_variants boolean/);
  assert.match(migration, /price_mode text[\s\S]*absolute[\s\S]*delta/);
  assert.match(actions, /function saveVariantV2\([\s\S]*requireAdmin\(\)/);
  assert.match(actions, /suboptions_required: suboptionsRequired/);
  assert.match(actions, /function saveSuboptionV2\([\s\S]*requireAdmin\(\)/);
  assert.match(actions, /applies_to_all_variants: appliesToAllVariants/);
  assert.match(actions, /price_mode: appliesToAllVariants \? "delta" : "absolute"/);
  assert.match(detail, /الخيار الفرعي إجباري لهذا العرض/);
  assert.match(detail, /تطبيق على جميع عروض المنتج/);
  assert.match(reader, /globalSuboptions/);
  assert.match(reader, /suboptionsRequired: Boolean\(variant\.suboptions_required\)/);
});

test("customer configurator calculates quantity and enables cart plus buy now", () => {
  const configurator = read("src/components/storefront/product-configurator.tsx");
  assert.match(configurator, /setQuantity/);
  assert.match(configurator, /unitPrice \* quantity/);
  assert.match(configurator, /addCartItem/);
  assert.match(configurator, /\/checkout\/catalog/);
  assert.match(configurator, /selectedVariant\?\.suboptionsRequired \?\? baseSuboptionsRequired/);
  assert.match(configurator, /selectedSuboption\.priceMode === "delta"/);
  assert.match(configurator, /إضافة إلى السلة/);
  assert.match(configurator, /اشترِ الآن/);
});

test("persistent cart never stores a browser supplied price and client writes stay blocked", () => {
  const migration = read("supabase/migrations/20260825135000_catalog_cart_checkout.sql");
  const cartActions = read("app/cart/actions.ts");
  const cartResolver = read("src/lib/cart/catalog-cart.ts");

  assert.match(migration, /create table public\.cart_items/);
  assert.doesNotMatch(migration, /cart_items[\s\S]{0,500}price numeric/);
  assert.match(migration, /grant select on table public\.cart_items to authenticated/);
  assert.doesNotMatch(migration, /grant (insert|update|delete)[^;]*cart_items[^;]*authenticated/);
  assert.match(migration, /cart_items_select_own/);
  assert.match(cartActions, /resolveCatalogSelection/);
  assert.match(cartActions, /createAdminClient/);
  assert.match(cartResolver, /customerPrice\(selectedUsd, settings\.rate, margin\)/);
});

test("catalog checkout recalculates authoritative pricing and is service-role only", () => {
  const migration = read("supabase/migrations/20260825135000_catalog_cart_checkout.sql");
  const action = read("app/checkout/catalog/actions.ts");
  const page = read("app/checkout/catalog/page.tsx");

  assert.match(migration, /create or replace function public\.create_catalog_checkout_order/);
  assert.match(migration, /v_unit_price := round\(v_selected_usd \* v_rate \* \(1 \+ v_margin\), 2\)/);
  assert.match(migration, /revoke all on function public\.create_catalog_checkout_order[\s\S]*public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.create_catalog_checkout_order[\s\S]*service_role/);
  assert.match(migration, /insert into public\.order_items[\s\S]*variant_id[\s\S]*suboption_id[\s\S]*customer_inputs/);
  assert.match(action, /create_catalog_checkout_order/);
  assert.doesNotMatch(action, /formData\.get\("price/);
  assert.match(page, /السعر النهائي لا يُؤخذ من المتصفح/);
});

test("legacy checkout explicitly excludes Catalog V2 products", () => {
  const checkout = read("app/checkout/[slug]/page.tsx");
  assert.match(checkout, /\.is\("subcategory_id", null\)/);
  assert.match(checkout, /if \(!product\?\.game_id\) notFound\(\)/);
});

test("banner carousel supports reduced motion, touch, pause and manual controls", () => {
  const slider = read("src/components/storefront/banner-slider.tsx");
  assert.match(slider, /prefers-reduced-motion: reduce/);
  assert.match(slider, /onTouchStart/);
  assert.match(slider, /onTouchEnd/);
  assert.match(slider, /setPaused/);
  assert.match(slider, /البنر السابق/);
  assert.match(slider, /البنر التالي/);
});

test("admin and customer hierarchy routes exist as separate pages", () => {
  for (const path of [
    "app/admin/catalog/categories/page.tsx",
    "app/admin/catalog/subcategories/page.tsx",
    "app/admin/catalog/products/page.tsx",
    "app/categories/[slug]/page.tsx",
    "app/catalog/[slug]/page.tsx",
    "app/cart/page.tsx",
    "app/checkout/catalog/page.tsx",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} is missing`);
  }
});
