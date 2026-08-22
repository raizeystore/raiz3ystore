import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("privileged Supabase secret stays out of browser-scoped clients", () => {
  const admin = read("src/lib/supabase/admin.ts");
  const browser = read("src/lib/supabase/client.ts");
  const proxy = read("src/lib/supabase/proxy.ts");

  assert.match(admin, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(admin, /NEXT_PUBLIC_SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(browser, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(proxy, /SUPABASE_SECRET_KEY/);
});

test("email registration validates profile, password and policy consent on the server", () => {
  const actions = read("app/auth/actions.ts");
  const migration = read("supabase/migrations/20260822212707_record_auth_profile_and_policy_consent.sql");

  assert.match(actions, /isStrongPassword\(password\)/);
  assert.match(actions, /isValidPhone\(phone\)/);
  assert.match(actions, /privacyAccepted/);
  assert.match(actions, /termsAccepted/);
  assert.match(actions, /privacy_accepted:\s*true/);
  assert.match(actions, /terms_accepted:\s*true/);
  assert.match(actions, /emailRedirectTo/);
  assert.match(migration, /privacy_accepted_at/);
  assert.match(migration, /terms_accepted_at/);
});

test("Google OAuth uses a server redirect and a PKCE callback before creating a session", () => {
  const actions = read("app/auth/actions.ts");
  const callback = read("app/auth/callback/route.ts");

  assert.match(actions, /signInWithOAuth/);
  assert.match(actions, /provider:\s*["']google["']/);
  assert.match(actions, /\/auth\/callback\?next=/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /startsWith\(["']\/complete-profile["']\)/);
  assert.match(callback, /user_metadata/);
});

test("checkout does not trust a client-supplied price and uses validated idempotency", () => {
  const checkoutAction = read("app/checkout/actions.ts");
  const checkoutPage = read("app/checkout/[slug]/page.tsx");

  assert.doesNotMatch(checkoutAction, /formData\.get\(["']price["']\)/);
  assert.match(checkoutPage, /crypto\.randomUUID\(\)/);
  assert.match(checkoutPage, /name=["']checkoutToken["']/);
  assert.match(checkoutAction, /formData\.get\(["']checkoutToken["']\)/);
  assert.match(checkoutAction, /UUID_RE\.test\(idempotencyKey\)/);
  assert.match(checkoutAction, /p_idempotency_key:\s*idempotencyKey/);
  assert.match(checkoutAction, /create_checkout_order/);
});

test("product-specific player requirements are rendered and revalidated server-side", () => {
  const checkoutPage = read("app/checkout/[slug]/page.tsx");
  const checkoutAction = read("app/checkout/actions.ts");
  const migration = read("supabase/migrations/20260822182710_add_auto_pricing_and_product_player_fields.sql");

  assert.match(checkoutPage, /player_id_required/);
  assert.match(checkoutPage, /player_name_required/);
  assert.match(checkoutPage, /required=\{product\.player_id_required\}/);
  assert.match(checkoutPage, /required=\{product\.player_name_required\}/);
  assert.doesNotMatch(checkoutAction, /\|\| !playerId/);
  assert.match(migration, /raise exception 'player_id_required'/);
  assert.match(migration, /raise exception 'player_name_required'/);
});

test("automatic USD pricing is enforced in PostgreSQL and reprices on store settings changes", () => {
  const migration = read("supabase/migrations/20260822182710_add_auto_pricing_and_product_player_fields.sql");
  const database = read("src/types/database.ts");

  assert.match(migration, /private\.apply_product_pricing/);
  assert.match(migration, /private\.reprice_products_after_settings_change/);
  assert.match(migration, /pricing_mode = 'usd_auto'/);
  assert.match(migration, /base_price_usd \* v_rate/);
  assert.match(migration, /default_profit_margin/);
  assert.match(database, /base_price_usd:\s*number \| null/);
  assert.match(database, /pricing_mode:\s*string/);
  assert.match(database, /profit_margin_override:\s*number \| null/);
});

test("receipt upload enforces size, MIME allowlist, ownership and non-upsert", () => {
  const receipt = read("app/orders/actions.ts");

  assert.match(receipt, /MAX_RECEIPT_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/);
  assert.match(receipt, /"image\/jpeg"/);
  assert.match(receipt, /"image\/png"/);
  assert.match(receipt, /"image\/webp"/);
  assert.match(receipt, /"application\/pdf"/);
  assert.match(receipt, /\.eq\("user_id", userId\)/);
  assert.match(receipt, /upsert:\s*false/);
  assert.match(receipt, /submit_payment_receipt/);
});

test("sensitive routes use no-store and baseline security headers", () => {
  const config = read("next.config.ts");

  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /private, no-store, max-age=0/);
  for (const route of ["/account", "/orders/:path*", "/admin/:path*", "/checkout/:path*", "/auth/:path*", "/register", "/complete-profile"]) {
    assert.ok(config.includes(route), `missing no-store route: ${route}`);
  }
});

test("Sentry browser monitoring never references an auth token and default PII remains disabled", () => {
  const client = read("instrumentation-client.ts");
  const server = read("sentry.server.config.ts");

  assert.doesNotMatch(client, /SENTRY_AUTH_TOKEN/);
  assert.match(client, /sendDefaultPii:\s*false/);
  assert.match(server, /sendDefaultPii:\s*false/);
});

test("database types contain current checkout idempotency contract", () => {
  const database = read("src/types/database.ts");

  assert.match(database, /idempotency_key:\s*string \| null/);
  assert.match(database, /p_idempotency_key:\s*string/);
});
