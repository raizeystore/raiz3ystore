"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { EmailOtpType } from "@supabase/supabase-js";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/src/lib/auth/policies";
import { createClient } from "@/src/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;
const SAFE_NEXT_RE = /^\/(?!\/)/;
const PENDING_EMAIL_COOKIE = "raizey_pending_email";
const PENDING_PURPOSE_COOKIE = "raizey_pending_purpose";
const PENDING_MAX_AGE = 15 * 60;

type VerificationPurpose = "signup" | "recovery";

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

function isVerificationPurpose(value: string | undefined): value is VerificationPurpose {
  return value === "signup" || value === "recovery";
}

function verificationPath(purpose: VerificationPurpose, query = "") {
  return `/verify-code?purpose=${purpose}${query ? `&${query}` : ""}`;
}

async function setPendingVerification(email: string, purpose: VerificationPurpose) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: PENDING_MAX_AGE,
  };
  cookieStore.set(PENDING_EMAIL_COOKIE, email, options);
  cookieStore.set(PENDING_PURPOSE_COOKIE, purpose, options);
}

async function readPendingVerification() {
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_EMAIL_COOKIE)?.value?.toLowerCase();
  const purposeValue = cookieStore.get(PENDING_PURPOSE_COOKIE)?.value;
  const purpose = isVerificationPurpose(purposeValue) ? purposeValue : null;
  if (!email || !EMAIL_RE.test(email) || !purpose) return null;
  return { email, purpose };
}

async function clearPendingVerification() {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const options = { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: 0 };
  cookieStore.set(PENDING_EMAIL_COOKIE, "", options);
  cookieStore.set(PENDING_PURPOSE_COOKIE, "", options);
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
    if (code === "email_not_confirmed") {
      await setPendingVerification(email, "signup");
      redirect(verificationPath("signup", "message=confirmation_required"));
    }
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
    },
  });

  if (error) {
    const code = authErrorCode(error);
    if (code === "over_email_send_rate_limit") redirect("/register?error=email_rate_limit");
    redirect("/register?error=signup_failed");
  }

  revalidatePath("/", "layout");
  if (data.session) redirect("/account?message=welcome");

  await setPendingVerification(email, "signup");
  redirect(verificationPath("signup", "message=sent"));
}

export async function verifyEmailCode(formData: FormData) {
  const code = text(formData, "code", 6).replace(/\D/g, "");
  const pending = await readPendingVerification();
  if (!pending) redirect("/login?error=verification_expired");
  if (!OTP_RE.test(code)) redirect(verificationPath(pending.purpose, "error=invalid_code"));

  const supabase = await createClient();
  const otpType: EmailOtpType = pending.purpose;
  const { error } = await supabase.auth.verifyOtp({
    email: pending.email,
    token: code,
    type: otpType,
  });

  if (error) {
    const errorCode = authErrorCode(error);
    const reason = errorCode === "otp_expired" || errorCode === "otp_disabled" ? "expired_code" : "invalid_code";
    redirect(verificationPath(pending.purpose, `error=${reason}`));
  }

  await clearPendingVerification();
  revalidatePath("/", "layout");

  if (pending.purpose === "recovery") {
    redirect("/reset-password?message=code_verified");
  }

  redirect("/account?message=email_verified");
}

export async function resendEmailCode() {
  const pending = await readPendingVerification();
  if (!pending) redirect("/login?error=verification_expired");

  const supabase = await createClient();
  const result = pending.purpose === "signup"
    ? await supabase.auth.resend({ type: "signup", email: pending.email })
    : await supabase.auth.resetPasswordForEmail(pending.email);

  if (result.error) {
    const code = authErrorCode(result.error);
    const reason = code === "over_email_send_rate_limit" ? "rate_limit" : "resend_failed";
    redirect(verificationPath(pending.purpose, `error=${reason}`));
  }

  await setPendingVerification(pending.email, pending.purpose);
  redirect(verificationPath(pending.purpose, "message=resent"));
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

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    const code = authErrorCode(error);
    if (code === "over_email_send_rate_limit") redirect("/forgot-password?error=rate_limit");
    redirect("/forgot-password?error=request_failed");
  }

  await setPendingVerification(email, "recovery");
  redirect(verificationPath("recovery", "message=sent"));
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
