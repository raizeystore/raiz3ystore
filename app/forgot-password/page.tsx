import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import { BrandLogo } from "@/src/components/brand-logo";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-shell auth-shell--single">
      <section className="auth-form-panel" aria-labelledby="forgot-title">
        <div className="auth-card">
          <div className="auth-card-header">
            <Link href="/" aria-label="العودة إلى الصفحة الرئيسية">
              <BrandLogo compact />
            </Link>
            <span className="eyebrow"><span className="eyebrow-dot" />استرجاع آمن للحساب</span>
            <h1 id="forgot-title">نسيت كلمة المرور؟</h1>
            <p>أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور.</p>
          </div>

          {params.message === "check_email" && (
            <div className="notice" role="status">إذا كان البريد مسجلًا، ستصلك رسالة الاسترجاع خلال لحظات.</div>
          )}
          {params.error && (
            <div className="notice notice-error" role="alert">تعذر إرسال طلب الاسترجاع الآن. حاول مرة أخرى.</div>
          )}

          <form className="auth-form" action={requestPasswordReset}>
            <label className="field">
              <span className="field-label">البريد الإلكتروني</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
              />
            </label>

            <button className="btn btn-primary btn-full" type="submit">إرسال رابط الاسترجاع</button>
          </form>

          <p className="auth-footnote">
            تذكرت كلمة المرور؟ <Link className="text-link" href="/login">العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
