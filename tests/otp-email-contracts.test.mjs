import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("OTP resend is protected by a 60 second server and client cooldown", () => {
  const actions = read("app/auth/actions.ts");
  const resendButton = read("src/components/auth/resend-code-button.tsx");

  assert.match(actions, /OTP_RESEND_COOLDOWN_SECONDS\s*=\s*60/);
  assert.match(actions, /PENDING_SENT_AT_COOKIE\s*=\s*["']raizey_otp_sent_at["']/);
  assert.match(actions, /readOtpResendCooldownSeconds\(\)/);
  assert.match(actions, /error=resend_wait&wait=/);
  assert.match(actions, /setPendingVerification\(email,\s*["']signup["'],\s*true\)/);
  assert.match(actions, /setPendingVerification\(email,\s*["']recovery["'],\s*true\)/);
  assert.match(resendButton, /disabled=\{waiting\}/);
  assert.match(resendButton, /إعادة الإرسال خلال/);
});

test("Supabase hosted email templates use the official RAIZEY logo and code-only OTP", () => {
  const paths = [
    "supabase/templates/confirm-signup.html",
    "supabase/templates/reset-password.html",
    "supabase/templates/change-email.html",
    "supabase/templates/reauthentication.html",
  ];

  for (const path of paths) {
    const template = read(path);
    assert.match(template, /\{\{ \.Token \}\}/, `${path} must render the OTP token`);
    assert.match(template, /\{\{ \.SiteURL \}\}\/brand\/raizey-store-logo\.png/, `${path} must use the official logo`);
    assert.doesNotMatch(template, /ConfirmationURL/, `${path} must not use link confirmation`);
  }
});
