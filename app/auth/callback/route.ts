import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=account_inactive", request.url));
  }

  const metadata = data.user.user_metadata ?? {};
  const hasPolicyConsent = metadata.privacy_accepted === true && metadata.terms_accepted === true;
  const requestedConsent = next.startsWith("/complete-profile") && next.includes("consent=1");

  if (!profile.phone || !hasPolicyConsent) {
    const destination = requestedConsent ? "/complete-profile?consent=1" : "/complete-profile";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
