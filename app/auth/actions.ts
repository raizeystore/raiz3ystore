"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/src/lib/auth/policies";
import { createClient } from "@/src/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_NEXT_RE = /^\/(?!\/)/;

function text(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function normalizePhone(value: string) {
  const cleaned = value.replace(/[\s()\-]/g, "");
  const candidate = cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
  const parsed = parsePhoneNumberFromString(candidate);
  return parsed?.isValid() ? parsed.number : candidate;
}

function isValidPhone(value: string) {
  const parsed = parsePhoneNumberFromString(value);
  return Boolean(parsed?.isValid());
}

function isStrongPassword(password: string) {
  if (password.length < 10) return false;
  const categories = [/[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (categories < 3) return false;
  return !/(password|qwerty|123456|letmein)/i.test(password);
}

function safeNext(value: string | null, fallback = "/account") {
  if (!value || !SAFE_NEXT_RE.test(value)) return fallback;
  return value;
}

async function getRequestOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return null;
  const protocol = headerStore.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  return `${protocol}://${host}`;
}

function authErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

async function beginGoogle(next: string, errorPath: "/login" | "/register") {
  const origin = await getRequestOrigin();
  if (!origin) redirect(`${errorPath}?error=google_failed`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error || !data.url) redirect(`${errorPath}?error=google_failed`);
  redirect(data.url);
}

export async function login(formData: FormData) {
  const email = text(formData, "email", 254).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) redirect("/login?error=missing_credentials");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const code = authErrorCode(error);
    if (code === "email_not_confirmed") redirect("/login?error=email_not_confirmed");
    if (code === "invalid_credentials") redirect("/login?error=invalid_credentials");
    redirect("/login?error=auth_failed");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=account_inactive");
  }

  const metadata = data.user.user_metadata ?? {};
  const hasPolicyConsent = metadata.privacy_accepted === true && metadata.terms_accepted === true;
  if (!profile.phone || !hasPolicyConsent) redirect("/complete-profile");

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signup(formData: FormData) {
  const displayName = text(formData, "displayName", 120);
  const email = text(formData, "email", 254).toLowerCase();
  const phone = normalizePhone(text(formData, "phone", 24));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const privacyAccepted = formData.get("privacyAccepted") === "on";
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (displayName.length < 2 || !EMAIL_RE.test(email)) redirect("/register?error=invalid_signup");
  if (!isValidPhone(phone)) redirect("/register?error=invalid_phone");
  if (password !== confirmPassword) redirect("/register?error=password_mismatch");
  if (!isStrongPassword(password)) redirect("/register?error=weak_password");
  if (!privacyAccepted || !termsAccepted) redirect("/register?error=consent_required");

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone,
        privacy_accepted: true,
        terms_accepted: true,
        privacy_version: PRIVACY_VERSION,
        terms_version: TERMS_VERSION,
      },
      ...(origin ? { emailRedirectTo: `${origin}/auth/confirm?next=/account` } : {}),
    },
  });

  if (error) {
    const code = authErrorCode(error);
    if (code === "over_email_send_rate_limit") redirect("/register?error=email_rate_limit");
    redirect("/register?error=signup_failed");
  }

  revalidatePath("/", "layout");
  if (data.session) redirect("/account?message=welcome");
  redirect("/login?message=check_email");
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(text(formData, "next", 300), "/account");
  await beginGoogle(next, "/login");
}

export async function registerWithGoogle(formData: FormData) {
  const privacyAccepted = formData.get("privacyAccepted") === "on";
  const termsAccepted = formData.get("termsAccepted") === "on";
  if (!privacyAccepted || !termsAccepted) redirect("/register?error=consent_required");
  await beginGoogle("/complete-profile?consent=1", "/register");
}

export async function completeProfile(formData: FormData) {
  const displayName = text(formData, "displayName", 120);
  const phone = normalizePhone(text(formData, "phone", 24));
  const privacyAccepted = formData.get("privacyAccepted") === "on";
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (displayName.length < 2) redirect("/complete-profile?error=invalid_name");
  if (!isValidPhone(phone)) redirect("/complete-profile?error=invalid_phone");
  if (!privacyAccepted || !termsAccepted) redirect("/complete-profile?error=consent_required");

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/login?error=session_required");

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      phone,
      privacy_accepted: true,
      terms_accepted: true,
      privacy_version: PRIVACY_VERSION,
      terms_version: TERMS_VERSION,
    },
  });

  if (error) redirect("/complete-profile?error=complete_failed");

  revalidatePath("/", "layout");
  revalidatePath("/account");
  redirect("/account?message=profile_completed");
}

export async function requestPasswordReset(formData: FormData) {
  const email = text(formData, "email", 254).toLowerCase();
  if (!EMAIL_RE.test(email)) redirect("/forgot-password?error=invalid_email");

  const origin = await getRequestOrigin();
  if (!origin) redirect("/forgot-password?error=request_failed");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  if (error) redirect("/forgot-password?error=request_failed");
  redirect("/forgot-password?message=check_email");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword || !isStrongPassword(password)) {
    redirect("/reset-password?error=invalid_password");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/login?error=session_required");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?error=update_failed");

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=password_updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
