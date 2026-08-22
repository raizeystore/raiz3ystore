import Link from "next/link";
import { login, signup } from "@/app/auth/actions";
import { BrandLogo } from "@/src/components/brand-logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-labelledby="auth-brand-title">
        <Link href="/" aria-label="العودة إلى الصفحة الرئيسية"><BrandLogo /></Link>

        <div className="auth-brand-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />حساب واحد لكل طلباتك</span>
          <h1 id="auth-brand-title">ارجع للعبك <span>بسرعة.</span></h1>
          <p>سجّل دخولك لمتابعة الطلبات، بيانات الشحن، وحالة التنفيذ من مكان واحد بتجربة واضحة وآمنة.</p>
          <div className="auth-trust-list">
            <span className="auth-trust-item">جلسات آمنة عبر Supabase Auth</span>
            <span className="auth-trust-item">حماية بيانات الحساب</span>
            <span className="auth-trust-item">متابعة حالة الطلب من حسابك</span>
          </div>
        </div>

        <span className="trust-chip">RAIZEY STORE • Secure Game Top-up</span>
      </section>

      <section className="auth-form-panel" aria-labelledby="login-title">
        <div className="auth-card">
          <div className="auth-card-header">
            <BrandLogo compact />
            <h2 id="login-title">مرحبًا بعودتك</h2>
            <p>أدخل بياناتك لتسجيل الدخول، أو أنشئ حساب جديد بنفس النموذج.</p>
          </div>

          {params.message === "check_email" && <div className="notice" role="status">تحقق من بريدك الإلكتروني لتأكيد الحساب.</div>}
          {params.message === "password_updated" && <div className="notice" role="status">تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.</div>}
          {params.message === "login_required" && <div className="notice" role="status">سجّل الدخول أو أنشئ حسابًا للمتابعة إلى الشراء والطلبات.</div>}
          {params.error && <div className="notice notice-error" role="alert">تعذر تنفيذ العملية. تحقق من البيانات أو صلاحية الرابط وحاول مرة أخرى.</div>}

          <form className="auth-form">
            <label className="field">
              <span className="field-label">البريد الإلكتروني</span>
              <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="name@example.com" />
            </label>

            <label className="field">
              <span className="field-label">كلمة المرور</span>
              <input name="password" type="password" required minLength={8} autoComplete="current-password" placeholder="8 أحرف على الأقل" />
            </label>

            <div className="form-meta"><span>بياناتك محمية</span><Link className="text-link" href="/forgot-password">نسيت كلمة المرور؟</Link></div>

            <button className="btn btn-primary btn-full" formAction={login} type="submit">تسجيل الدخول</button>
            <div className="auth-divider">أو</div>
            <button className="btn btn-secondary btn-full" formAction={signup} type="submit">إنشاء حساب جديد</button>
          </form>

          <p className="auth-footnote">بمتابعتك، أنت تستخدم الحساب فقط لإدارة طلباتك وخدمات المتجر.</p>
        </div>
      </section>
    </main>
  );
}
