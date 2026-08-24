import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { updateProfile } from "@/app/account/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { MailIcon, ShieldCheckIcon, UserIcon } from "@/src/components/auth/auth-icons";
import { createClient } from "@/src/lib/supabase/server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active) redirect("/login?error=account_inactive");
  const metadata = user.user_metadata ?? {};
  if (!profile.phone || metadata.privacy_accepted !== true || metadata.terms_accepted !== true) {
    redirect("/complete-profile");
  }

  const roleLabel = profile.role === "admin" ? "إدارة المتجر" : "عميل";
  const message =
    params.message === "profile_completed"
      ? "اكتملت بيانات حسابك بنجاح."
      : params.message === "welcome"
        ? "مرحبًا بك في RAIZEY STORE."
        : params.message === "email_updated"
          ? "تم تغيير البريد الإلكتروني وتأكيده بنجاح."
          : params.message === "profile_updated"
            ? "تم تحديث بيانات الحساب بنجاح."
            : null;

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="تنقل الحساب">
            <Link href="/games">الألعاب</Link>
            <Link href="/orders">طلباتي</Link>
            <Link href="/account/security">الأمان</Link>
            {profile.role === "admin" && <Link href="/admin">الإدارة</Link>}
          </nav>
          <div className="nav-actions"><Link className="btn btn-secondary" href="/">العودة للمتجر</Link></div>
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

          {message ? <div className="notice" role="status" style={{ marginBottom: 20 }}>{message}</div> : null}
          {params.error ? <div className="notice notice-error" role="alert" style={{ marginBottom: 20 }}>تعذر تحديث البيانات. تحقق من القيم وحاول مرة أخرى.</div> : null}

          <div className="info-grid">
            <article className="info-card">
              <div className="icon-box" aria-hidden="true"><MailIcon /></div>
              <h3>البريد الإلكتروني</h3>
              <p dir="ltr" style={{ overflowWrap: "anywhere" }}>{user.email ?? "—"}</p>
            </article>
            <article className="info-card">
              <div className="icon-box" aria-hidden="true"><UserIcon /></div>
              <h3>نوع الحساب</h3>
              <p>{roleLabel}</p>
            </article>
            <article className="info-card">
              <div className="icon-box" aria-hidden="true"><ShieldCheckIcon /></div>
              <h3>حالة الحساب</h3>
              <p>نشط ومحمي</p>
            </article>
          </div>

          <div className="auth-card" style={{ marginTop: 24, maxWidth: 720 }}>
            <div className="auth-card-header">
              <h2>بيانات الملف الشخصي</h2>
              <p>المسموح لك تعديله هنا هو الاسم ورقم الهاتف فقط. صلاحيات الحساب والدور الإداري محمية على مستوى قاعدة البيانات.</p>
            </div>

            <form className="auth-form" action={updateProfile}>
              <label className="field"><span className="field-label">الاسم الظاهر</span><input name="displayName" type="text" maxLength={80} defaultValue={profile.display_name ?? ""} autoComplete="name" placeholder="اكتب اسمك" /></label>
              <label className="field"><span className="field-label">رقم الهاتف</span><input name="phone" type="tel" maxLength={30} defaultValue={profile.phone ?? ""} autoComplete="tel" inputMode="tel" placeholder="رقم الهاتف" /></label>
              <button className="btn btn-primary" type="submit">حفظ التغييرات</button>
            </form>
          </div>

          <div className="auth-card" style={{ marginTop: 24, maxWidth: 720 }}>
            <div className="auth-card-header">
              <h2>أمان الحساب</h2>
              <p>تغيير البريد أو كلمة المرور محمي بكود تحقق من 6 أرقام. افتح مركز الأمان لإدارة بيانات الدخول الحساسة.</p>
            </div>
            <Link className="btn btn-primary" href="/account/security">فتح مركز الأمان</Link>
          </div>

          <div className="cta-band" style={{ marginTop: 24 }}>
            <div><h2>{profile.display_name ? `مرحبًا ${profile.display_name}` : "مرحبًا بك في RAIZEY"}</h2><p>تابع طلباتك والدفع والمراجعة من مركز الطلبات.</p></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link className="btn btn-primary" href="/orders">طلباتي</Link>
              <Link className="btn btn-secondary" href="/account/security">الأمان</Link>
              {profile.role === "admin" && <Link className="btn btn-secondary" href="/admin">لوحة الإدارة</Link>}
              <form action={signOut}><button className="btn btn-secondary" type="submit">تسجيل الخروج</button></form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
