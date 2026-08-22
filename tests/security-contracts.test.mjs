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

test("checkout does not trust a client-supplied price and uses idempotency", () => {
  const checkout = read("app/checkout/actions.ts");

  assert.doesNotMatch(checkout, /formData\.get\(["']price["']\)/);
  assert.match(checkout, /crypto\.randomUUID\(\)/);
  assert.match(checkout, /p_idempotency_key/);
  assert.match(checkout, /create_checkout_order/);
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
  for (const route of ["/account", "/orders/:path*", "/admin/:path*", "/checkout/:path*", "/auth/:path*"]) {
    assert.ok(config.includes(route), `missing no-store route: ${route}`);
  }
});

test("database types contain current checkout idempotency contract", () => {
  const database = read("src/types/database.ts");

  assert.match(database, /idempotency_key:\s*string \| null/);
  assert.match(database, /p_idempotency_key:\s*string/);
});
