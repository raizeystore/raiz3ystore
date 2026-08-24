import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("catalog migration keeps the official normalized hierarchy and legacy rollback path", () => {
  const migration = read("supabase/migrations/20260824214439_add_catalog_v2.sql");
  const exclusivityMigration = read(
    "supabase/migrations/20260824225440_enforce_catalog_product_parent_exclusivity.sql",
  );

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
  assert.match(
    exclusivityMigration,
    /\(game_id is null\) <> \(subcategory_id is null\)/,
  );
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

test("admin catalog mutations verify admin sessions and parent relationships", () => {
  const actions = read("app/admin/catalog/v2-actions.ts");

  for (const action of [
    "saveCategory",
    "saveSubcategory",
    "saveCatalogProduct",
    "saveVariant",
    "saveSuboption",
    "saveInputField",
  ]) {
    assert.match(actions, new RegExp(`function ${action}\\([\\s\\S]*?requireAdmin\\(\\)`));
  }
  assert.match(actions, /from\("categories"\)[\s\S]*eq\("id", categoryId\)/);
  assert.match(actions, /from\("subcategories"\)[\s\S]*eq\("id", subcategoryId\)/);
  assert.match(actions, /suboptions_required: suboptionsRequired/);
  assert.match(actions, /Catalog audit event could not be recorded/);
  assert.doesNotMatch(actions, /\.delete\(/);
});

test("customer product selection uses absolute price priority and required suboptions", () => {
  const configurator = read("src/components/storefront/product-configurator.tsx");

  assert.match(
    configurator,
    /selectedSuboption\?\.customerPrice \?\?[\s\S]*selectedVariant\?\.customerPrice \?\?[\s\S]*baseCustomerPrice/,
  );
  assert.match(configurator, /suboptionsRequired/);
  assert.match(configurator, /required=\{needsSuboption\}/);
  assert.match(configurator, /setSuboptionId\(""\)/);
  assert.match(configurator, /disabled/);
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
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} is missing`);
  }
});
