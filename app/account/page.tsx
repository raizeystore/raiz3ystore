import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { updateProfile } from "@/app/account/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
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

          {params.message === "profile_updated" && (
            <div className="notice" role="status" style={{ marginBottom: 20 }}>تم تحديث بيانات الحساب بنجاح.</div>
          )}
          {params.error && (
            <div className="notice notice-error" role="alert" style={{ marginBottom: 20 }}>تعذر تحديث البيانات. تحقق من القيم وحاول مرة أخرى.</div>
          )}

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

          <div className="auth-card" style={{ marginTop: 24, maxWidth: 720 }}>
            <div className="auth-card-header">
              <h2>بيانات الملف الشخصي</h2>
              <p>المسموح لك تعديله هنا هو الاسم ورقم الهاتف فقط. صلاحيات الحساب والدور الإداري محمية على مستوى قاعدة البيانات.</p>
            </div>

            <form className="auth-form" action={updateProfile}>
              <label className="field">
                <span className="field-label">الاسم الظاهر</span>
                <input
                  name="displayName"
                  type="text"
                  maxLength={80}
                  defaultValue={profile?.display_name ?? ""}
                  autoComplete="name"
                  placeholder="اكتب اسمك"
                />
              </label>

              <label className="field">
                <span className="field-label">رقم الهاتف</span>
                <input
                  name="phone"
                  type="tel"
                  maxLength={30}
                  defaultValue={profile?.phone ?? ""}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="رقم الهاتف"
                />
              </label>

              <button className="btn btn-primary" type="submit">حفظ التغييرات</button>
            </form>
          </div>

          <div className="cta-band" style={{ marginTop: 24 }}>
            <div>
              <h2>{profile?.display_name ? `مرحبًا ${profile.display_name}` : "مرحبًا بك في RAIZEY"}</h2>
              <p>مركز الطلبات والإشعارات سيظهر هنا تلقائيًا بعد تفعيل مرحلة الطلبات.</p>
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
