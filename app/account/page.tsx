import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { BrandLogo } from "@/src/components/brand-logo";
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

  const roleLabel = profile?.role === "admin" ? "إدارة المتجر" : "عميل";

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <div className="nav-actions">
            <Link className="btn btn-secondary" href="/">العودة للمتجر</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />حساب محمي</span>
              <h1>حسابي</h1>
              <p>بيانات الحساب الأساسية ومركز الوصول لطلباتك وخدماتك في RAIZEY STORE.</p>
            </div>
          </div>

          <div className="info-grid">
            <article className="info-card">
              <div className="icon-box">@</div>
              <h3>البريد الإلكتروني</h3>
              <p>{String(data.claims.email ?? "—")}</p>
            </article>
            <article className="info-card">
              <div className="icon-box">R</div>
              <h3>نوع الحساب</h3>
              <p>{roleLabel}</p>
            </article>
            <article className="info-card">
              <div className="icon-box">✓</div>
              <h3>حالة الحساب</h3>
              <p>{profile?.is_active === false ? "موقوف" : "نشط"}</p>
            </article>
          </div>

          <div className="cta-band" style={{ marginTop: 24 }}>
            <div>
              <h2>{profile?.display_name ? `مرحبًا ${profile.display_name}` : "مرحبًا بك في RAIZEY"}</h2>
              <p>تعديل الملف الشخصي سيُفعّل بعد إكمال تشديد صلاحيات قاعدة البيانات حتى ما تكون أي حقول إدارية قابلة للتلاعب من العميل.</p>
            </div>
            <form action={signOut}>
              <button className="btn btn-secondary" type="submit">تسجيل الخروج</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
