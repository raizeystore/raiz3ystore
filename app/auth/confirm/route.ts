import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");
  const next = getSafeNext(searchParams.get("next"));
  const supabase = await createClient();

  async function redirectAuthenticatedUser() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));

    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=account_inactive", request.url));
    }

    const metadata = user.user_metadata ?? {};
    const hasPolicyConsent = metadata.privacy_accepted === true && metadata.terms_accepted === true;
    if (!profile.phone || !hasPolicyConsent) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return redirectAuthenticatedUser();
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error) return redirectAuthenticatedUser();
  }

  return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
}
