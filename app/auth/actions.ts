"use server";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
