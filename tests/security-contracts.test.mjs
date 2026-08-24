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
  assert.match(actions, /setPendingVerification\(email,\s*["']signup["']\)/);
  assert.doesNotMatch(actions, /signUp\([\s\S]*emailRedirectTo/);
  assert.match(migration, /privacy_accepted_at/);
  assert.match(migration, /terms_accepted_at/);
});

test("email confirmation and password recovery use native six-digit Supabase OTP", () => {
  const actions = read("app/auth/actions.ts");
  const verifyPage = read("app/verify-code/page.tsx");
  const otpDocs = read("docs/SUPABASE_EMAIL_OTP.md");

  assert.match(actions, /OTP_RE\s*=\s*\/\^\\d\{6\}\$\//);
  assert.match(actions, /verifyOtp\(/);
  assert.match(actions, /type:\s*otpType/);
  assert.match(actions, /resetPasswordForEmail\(email\)/);
  assert.match(actions, /auth\.resend\(\{\s*type:\s*["']signup["']/);
  assert.match(actions, /httpOnly:\s*true/);
  assert.match(actions, /sameSite:\s*["']lax["']/);
  assert.match(verifyPage, /autoComplete=["']one-time-code["']/);
  assert.match(verifyPage, /pattern=["']\[0-9\]\{6\}["']/);
  assert.match(otpDocs, /\{\{ \.Token \}\}/);
  assert.doesNotMatch(otpDocs, /href=["'][^"']*ConfirmationURL/);
});

test("signed-in password changes require Supabase reauthentication OTP", () => {
  const actions = read("app/account/security/actions.ts");
  const passwordForm = read("src/components/auth/account-password-form.tsx");

  assert.match(actions, /auth\.reauthenticate\(\)/);
  assert.match(actions, /OTP_RE\s*=\s*\/\^\\d\{6\}\$\//);
  assert.match(actions, /updateUser\(\{\s*password,\s*nonce\s*\}\)/);
  assert.match(actions, /auth\.signOut\(\)/);
  assert.match(passwordForm, /autoComplete=["']one-time-code["']/);
  assert.match(passwordForm, /pattern=["']\[0-9\]\{6\}["']/);
  assert.match(passwordForm, /name=["']confirmPassword["']/);
});

test("secure email change requires current and new email verification stages", () => {
  const actions = read("app/account/security/actions.ts");
  const emailPage = read("app/account/security/email/page.tsx");
  const otpDocs = read("docs/SUPABASE_EMAIL_OTP.md");

  assert.match(actions, /updateUser\(\{\s*email:\s*newEmail\s*\}\)/);
  assert.match(actions, /EMAIL_CHANGE_STAGE/);
  assert.match(actions, /stage !== ["']current["']/);
  assert.match(actions, /stage !== ["']new["']/);
  assert.match(actions, /email:\s*state\.oldEmail[\s\S]*type:\s*["']email_change["']/);
  assert.match(actions, /email:\s*state\.newEmail[\s\S]*type:\s*["']email_change["']/);
  assert.match(actions, /httpOnly:\s*true/);
  assert.match(actions, /sameSite:\s*["']lax["']/);
  assert.match(actions, /secure:\s*process\.env\.NODE_ENV === ["']production["']/);
  assert.match(emailPage, /isCurrent \? ["']تأكيد البريد الحالي["'] : ["']تأكيد البريد الجديد["']/);
  assert.match(emailPage, /pattern=["']\[0-9\]\{6\}["']/);
  assert.match(otpDocs, /Secure Email Change must remain enabled/);
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
  for (const route of [
    "/account",
    "/account/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/auth/:path*",
    "/login",
    "/register",
    "/complete-profile",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
  ]) {
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
