import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("all brand logo variants use the official full logo", () => {
  const brand = read("src/components/brand-logo.tsx");
  assert.match(brand, /\/brand\/raizey-store-logo\.png/);
  assert.doesNotMatch(brand, /raizey-store-mark\.png/);
});

test("catalog media uploads are restricted and server-side", () => {
  const migration = read("supabase/migrations/20260825001943_add_catalog_media_bucket.sql");
  const media = read("src/lib/catalog/media.ts");
  const actions = read("app/admin/catalog/v2-actions.ts");

  assert.match(migration, /'catalog-media'/);
  assert.match(migration, /5242880/);
  assert.match(migration, /image\/jpeg/);
  assert.match(migration, /image\/png/);
  assert.match(migration, /image\/webp/);
  assert.match(media, /CATALOG_MEDIA_MAX_BYTES = 5 \* 1024 \* 1024/);
  assert.match(media, /admin\.storage\.from\(CATALOG_MEDIA_BUCKET\)\.upload/);
  assert.match(actions, /requireAdmin\(\)/);
  assert.match(actions, /resolveCatalogImage/);
});

test("admin catalog hides technical slug and sku fields from normal forms", () => {
  for (const path of [
    "app/admin/catalog/page.tsx",
    "app/admin/catalog/categories/page.tsx",
    "app/admin/catalog/subcategories/page.tsx",
    "app/admin/catalog/products/page.tsx",
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /field-label">Slug/);
    assert.doesNotMatch(source, /field-label">SKU/);
    assert.doesNotMatch(source, /field-label">رابط الصورة/);
    assert.match(source, /type="file"/);
  }
});

test("direct product suboptions use an internal base variant and absolute price", () => {
  const actions = read("app/admin/catalog/v2-actions.ts");
  const detail = read("app/admin/catalog/products/[id]/page.tsx");
  const storefront = read("src/lib/catalog/storefront.ts");
  const configurator = read("src/components/storefront/product-configurator.tsx");

  assert.match(actions, /DIRECT_PRODUCT_VARIANT = "__product_base__"/);
  assert.match(actions, /SYSTEM_BASE_VARIANT_SKU = "__BASE__"/);
  assert.match(detail, /المنتج مباشرة/);
  assert.match(detail, /حساب موثق \+ فيزا/);
  assert.match(storefront, /directSuboptions/);
  assert.match(storefront, /variant\.sku !== SYSTEM_BASE_VARIANT_SKU/);
  assert.match(
    configurator,
    /selectedSuboption\?\.customerPrice \?\?[\s\S]*selectedVariant\?\.customerPrice \?\?[\s\S]*baseCustomerPrice/,
  );
  assert.match(configurator, /required=\{needsSuboption\}/);
});

test("banner editor uploads from device and keeps mobile image optional", () => {
  const page = read("app/admin/settings/banners/page.tsx");
  const actions = read("app/admin/settings/banners/actions.ts");
  assert.match(page, /name="desktopImageFile" type="file"/);
  assert.match(page, /name="mobileImageFile" type="file"/);
  assert.doesNotMatch(page, /name="mobileImageFile"[^>]*required/);
  assert.match(actions, /resolveCatalogImage/);
  assert.match(actions, /desktop_image_required/);
});

test("security center uses compact mobile-specific sizing", () => {
  const page = read("app/account/security/page.tsx");
  const css = read("app/account/security/security.module.css");
  assert.match(page, /security\.module\.css/);
  assert.match(css, /max-width: 760px/);
  assert.match(css, /padding: 17px/);
  assert.match(css, /@media \(max-width: 640px\)/);
});
