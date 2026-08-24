"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;
const COMMON_PASSWORDS = /(password|qwerty|123456|letmein|admin|raizey)/i;

const EMAIL_CHANGE_OLD = "raizey_email_change_old";
const EMAIL_CHANGE_NEW = "raizey_email_change_new";
const EMAIL_CHANGE_STAGE = "raizey_email_change_stage";
const EMAIL_CHANGE_MAX_AGE = 15 * 60;

type EmailChangeStage = "current" | "new";

function text(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function isStrongPassword(password: string) {
  if (password.length < 10 || COMMON_PASSWORDS.test(password)) return false;
  const categories = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
  return categories >= 3;
}

function authErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function cookieOptions(maxAge = EMAIL_CHANGE_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?error=session_required");
  return { supabase, user: data.user };
}

async function setEmailChangeState(oldEmail: string, newEmail: string, stage: EmailChangeStage) {
  const cookieStore = await cookies();
  const options = cookieOptions();
  cookieStore.set(EMAIL_CHANGE_OLD, oldEmail, options);
  cookieStore.set(EMAIL_CHANGE_NEW, newEmail, options);
  cookieStore.set(EMAIL_CHANGE_STAGE, stage, options);
}

async function readEmailChangeState() {
  const cookieStore = await cookies();
  const oldEmail = cookieStore.get(EMAIL_CHANGE_OLD)?.value?.toLowerCase();
  const newEmail = cookieStore.get(EMAIL_CHANGE_NEW)?.value?.toLowerCase();
  const stageValue = cookieStore.get(EMAIL_CHANGE_STAGE)?.value;
  const stage: EmailChangeStage | null = stageValue === "current" || stageValue === "new" ? stageValue : null;

  if (!oldEmail || !newEmail || !stage || !EMAIL_RE.test(oldEmail) || !EMAIL_RE.test(newEmail)) return null;
  return { oldEmail, newEmail, stage };
}

async function clearEmailChangeState() {
  const cookieStore = await cookies();
  const options = cookieOptions(0);
  cookieStore.set(EMAIL_CHANGE_OLD, "", options);
  cookieStore.set(EMAIL_CHANGE_NEW, "", options);
  cookieStore.set(EMAIL_CHANGE_STAGE, "", options);
}

export async function requestPasswordChangeCode() {
  const { supabase } = await requireUser();
  const { error } = await supabase.auth.reauthenticate();

  if (error) {
    const code = authErrorCode(error);
    const reason = code === "over_email_send_rate_limit" ? "rate_limit" : "send_failed";
    redirect(`/account/security?password_error=${reason}`);
  }

  redirect("/account/security/password?message=code_sent");
}

export async function confirmPasswordChange(formData: FormData) {
  const nonce = text(formData, "code", 6).replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!OTP_RE.test(nonce)) redirect("/account/security/password?error=invalid_code");
  if (password !== confirmPassword || !isStrongPassword(password)) {
    redirect("/account/security/password?error=invalid_password");
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (error) {
    const code = authErrorCode(error);
    const reason = code === "reauthentication_not_valid" || code === "otp_expired" ? "invalid_code" : "update_failed";
    redirect(`/account/security/password?error=${reason}`);
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=password_updated");
}

export async function requestEmailChange(formData: FormData) {
  const newEmail = text(formData, "newEmail", 254).toLowerCase();
  if (!EMAIL_RE.test(newEmail)) redirect("/account/security?email_error=invalid_email");

  const { supabase, user } = await requireUser();
  const oldEmail = user.email?.toLowerCase();
  if (!oldEmail || !EMAIL_RE.test(oldEmail)) redirect("/account/security?email_error=missing_email");
  if (oldEmail === newEmail) redirect("/account/security?email_error=same_email");

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    const code = authErrorCode(error);
    const reason = code === "email_exists" || code === "email_address_not_authorized" ? "email_unavailable" : code === "over_email_send_rate_limit" ? "rate_limit" : "send_failed";
    redirect(`/account/security?email_error=${reason}`);
  }

  await setEmailChangeState(oldEmail, newEmail, "current");
  redirect("/account/security/email?message=codes_sent");
}

export async function verifyCurrentEmailChangeCode(formData: FormData) {
  const code = text(formData, "code", 6).replace(/\D/g, "");
  if (!OTP_RE.test(code)) redirect("/account/security/email?error=invalid_code");

  const state = await readEmailChangeState();
  if (!state || state.stage !== "current") redirect("/account/security?email_error=verification_expired");

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.verifyOtp({
    email: state.oldEmail,
    token: code,
    type: "email_change",
  });

  if (error) {
    const reason = authErrorCode(error) === "otp_expired" ? "expired_code" : "invalid_code";
    redirect(`/account/security/email?error=${reason}`);
  }

  await setEmailChangeState(state.oldEmail, state.newEmail, "new");
  redirect("/account/security/email?message=current_verified");
}

export async function verifyNewEmailChangeCode(formData: FormData) {
  const code = text(formData, "code", 6).replace(/\D/g, "");
  if (!OTP_RE.test(code)) redirect("/account/security/email?error=invalid_code");

  const state = await readEmailChangeState();
  if (!state || state.stage !== "new") redirect("/account/security?email_error=verification_expired");

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.verifyOtp({
    email: state.newEmail,
    token: code,
    type: "email_change",
  });

  if (error) {
    const reason = authErrorCode(error) === "otp_expired" ? "expired_code" : "invalid_code";
    redirect(`/account/security/email?error=${reason}`);
  }

  await clearEmailChangeState();
  revalidatePath("/account");
  revalidatePath("/", "layout");
  redirect("/account?message=email_updated");
}
