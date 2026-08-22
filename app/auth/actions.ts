"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function login(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || !password) redirect("/login?error=missing_credentials");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/login?error=invalid_credentials");
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signup(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || password.length < 8) redirect("/login?error=invalid_signup");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) redirect("/login?error=signup_failed");
  revalidatePath("/", "layout");
  redirect("/login?message=check_email");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/forgot-password?error=invalid_email");

  const headerStore = await headers();
  const origin = headerStore.get("origin");
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

  if (password.length < 8 || password !== confirmPassword) {
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
