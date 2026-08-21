import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/src/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, role, is_active")
    .eq("id", data.claims.sub)
    .single();

  return (
    <main style={{ maxWidth: 720, margin: "4rem auto", padding: "1rem" }}>
      <h1>حسابي</h1>
      <p>البريد: {String(data.claims.email ?? "")}</p>
      <p>الاسم: {profile?.display_name ?? "—"}</p>
      <p>الدور: {profile?.role ?? "customer"}</p>
      <form action={signOut}>
        <button type="submit">تسجيل الخروج</button>
      </form>
    </main>
  );
}
