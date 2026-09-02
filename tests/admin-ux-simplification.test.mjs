import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("all brand logo variants use the official full logo", () => {
  const brand = read("src/components/brand-logo.tsx");
  const header = read("src/components/storefront/store-header-client.tsx");
  const officialLogo = readFileSync(
    new URL("../public/brand/raizey-store-logo.png", import.meta.url),
  );

  assert.match(brand, /\/brand\/raizey-store-logo\.png/);
  assert.doesNotMatch(brand, /raizey-store-mark\.png/);
  assert.match(header, /\/brand\/raizey-store-logo\.png/);
  assert.doesNotMatch(header, /\/images\/raizey-store-logo\.png/);
  assert.equal(officialLogo.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
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

test("catalog admin is separated into sections and hides technical fields", () => {
  const hub = read("app/admin/catalog/page.tsx");
  const categories = read("app/admin/catalog/categories/page.tsx");
  const subcategories = read("app/admin/catalog/subcategories/page.tsx");
  const products = read("app/admin/catalog/products/page.tsx");

  assert.match(hub, /الأقسام/);
  assert.match(hub, /التصنيفات/);
  assert.match(hub, /المنتجات/);
  assert.doesNotMatch(categories, /type="file"/);
  assert.match(subcategories, /name="imageFile" type="file"[^>]*required/);
  assert.match(products, /name="imageFile" type="file"[^>]*required/);
  assert.match(products, /name="q"/);

  for (const source of [categories, subcategories, products]) {
    assert.doesNotMatch(source, /field-label">Slug/);
    assert.doesNotMatch(source, /field-label">SKU/);
    assert.doesNotMatch(source, /field-label">رابط الصورة/);
  }
});

test("public catalog policies never require the private admin helper", () => {
  const productsPolicy = read("supabase/migrations/20260825095126_fix_public_catalog_product_read_policy.sql");
  const gamesPolicy = read("supabase/migrations/20260825095150_fix_public_games_read_policy.sql");
  assert.doesNotMatch(productsPolicy, /private\.is_admin/);
  assert.doesNotMatch(gamesPolicy, /private\.is_admin/);
  assert.match(productsPolicy, /to anon, authenticated/);
  assert.match(gamesPolicy, /status = 'active'/);
});

test("storefront header centers branding and exposes account-aware tools including cart", () => {
  const wrapper = read("src/components/storefront/store-header.tsx");
  const header = read("src/components/storefront/store-header-client.tsx");
  const shell = read("src/lib/storefront/shell.ts");
  const css = read("src/components/storefront/store-header.module.css");
  const searchPage = read("app/search/page.tsx");
  const searchLib = read("src/lib/catalog/search.ts");

  assert.match(wrapper, /getStoreHeaderContext/);
  assert.match(header, /Menu/);
  assert.match(header, /href="\/search"/);
  assert.match(header, /Bell/);
  assert.match(header, /WalletCards/);
  assert.match(header, /href: "\/cart"/);
  assert.match(header, /context\.cartItemCount/);
  assert.match(header, /شحن المحفظة/);
  assert.match(header, /طلباتي/);
  assert.match(header, /إحالاتي وأرباحي/);
  assert.match(header, /إعدادات الحساب/);
  assert.match(header, /adminOnly: true/);
  assert.match(header, /signOut/);
  assert.match(shell, /cartItemCount/);
  assert.match(shell, /from\("cart_items"\)/);
  assert.match(css, /left: 50%/);
  assert.match(css, /right: 0/);
  assert.match(searchPage, /البحث عن المنتجات/);
  assert.match(searchLib, /searchCatalogProducts/);
});

test("storefront shell foundations keep wallet writes server-only and alerts scoped", () => {
  const migration = read("supabase/migrations/20260825122247_storefront_shell_foundations.sql");
  const notifications = read("app/notifications/page.tsx");
  const wallet = read("app/wallet/page.tsx");
  const ticker = read("src/components/storefront/store-ticker.tsx");
  const banner = read("src/components/storefront/banner-slider.tsx");
  const bannerAdmin = read("app/admin/settings/banners/page.tsx");

  assert.match(migration, /create table if not exists public\.wallet_accounts/);
  assert.match(migration, /revoke insert, update, delete on table public\.wallet_accounts from authenticated/);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /create table if not exists public\.ticker_messages/);
  assert.match(migration, /v_admin_title := 'دفعة تحتاج مراجعة'/);
  assert.match(migration, /new\.admin_note/);
  assert.match(notifications, /markAllNotificationsRead/);
  assert.match(wallet, /رصيدك محفوظ في حسابك/);
  assert.match(ticker, /DEFAULT_MESSAGES/);
  assert.match(banner, /7000/);
  assert.match(banner, /BUILTIN_BANNERS/);
  assert.match(bannerAdmin, /saveTickerMessage/);
});

test("unified product admin keeps variants and global or specific suboptions in one product", () => {
  const actions = read("app/admin/catalog/product-option-actions.ts");
  const detail = read("app/admin/catalog/products/[id]/page.tsx");
  const reader = read("src/lib/catalog/product-detail-v2.ts");
  const configurator = read("src/components/storefront/product-configurator.tsx");

  assert.match(actions, /DIRECT_PRODUCT_VARIANT = "__product_base__"/);
  assert.match(actions, /SYSTEM_BASE_VARIANT_SKU = "__BASE__"/);
  assert.match(detail, /60 UC/);
  assert.match(detail, /325 UC/);
  assert.match(detail, /660 UC/);
  assert.match(detail, /تطبيق على جميع عروض المنتج/);
  assert.match(reader, /directSuboptions/);
  assert.match(reader, /globalSuboptions/);
  assert.match(reader, /variant\.sku !== SYSTEM_BASE_VARIANT_SKU/);
  assert.match(configurator, /baseUnitPrice \+ selectedSuboption\.customerPrice/);
  assert.match(configurator, /selectedSuboption\.customerPrice/);
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
