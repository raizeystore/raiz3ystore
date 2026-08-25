import Link from "next/link";
import { redirect } from "next/navigation";
import { requestEmailChange, requestPasswordChangeCode } from "@/app/account/security/actions";
import styles from "@/app/account/security/security.module.css";
import { BrandLogo } from "@/src/components/brand-logo";
import { LockIcon, MailIcon, ShieldCheckIcon } from "@/src/components/auth/auth-icons";
import { createClient } from "@/src/lib/supabase/server";

const passwordErrors: Record<string, string> = {
  rate_limit: "تم إرسال عدد كبير من الأكواد. انتظر قليلًا ثم حاول مرة أخرى.",
  send_failed: "تعذر إرسال رمز التحقق الآن. حاول مرة أخرى بعد قليل.",
};

const emailErrors: Record<string, string> = {
  invalid_email: "أدخل بريدًا إلكترونيًا صالحًا.",
  missing_email: "تعذر قراءة البريد الحالي من حسابك.",
  same_email: "البريد الجديد مطابق للبريد الحالي.",
  email_unavailable: "لا يمكن استخدام هذا البريد. جرّب بريدًا آخر.",
  rate_limit: "تم إرسال عدد كبير من رسائل التحقق. انتظر قليلًا ثم حاول مرة أخرى.",
  send_failed: "تعذر بدء تغيير البريد الآن. حاول مرة أخرى بعد قليل.",
  verification_expired: "انتهت جلسة تغيير البريد. ابدأ العملية من جديد.",
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ password_error?: string; email_error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?error=session_required");

  const passwordError = params.password_error ? passwordErrors[params.password_error] ?? passwordErrors.send_failed : null;
  const emailError = params.email_error ? emailErrors[params.email_error] ?? emailErrors.send_failed : null;

  return (
    <main className={`site-shell ${styles.page}`}>
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo size="sm" /></Link>
          <nav className="nav-links" aria-label="تنقل الحساب">
            <Link href="/account">حسابي</Link>
            <Link href="/orders">طلباتي</Link>
          </nav>
          <div className="nav-actions"><Link className="btn btn-secondary" href="/account">العودة للحساب</Link></div>
        </div>
      </header>

      <section className="section">
        <div className={`container ${styles.container}`}>
          <div className={`section-heading ${styles.heading}`}>
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />حماية الحساب</span>
              <h1>مركز الأمان</h1>
              <p>تغيير كلمة المرور أو البريد يتطلب كود تحقق من 6 أرقام يُرسل إلى بريد الحساب.</p>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <article className={`info-card ${styles.summaryCard}`}>
              <div className="icon-box" aria-hidden="true"><ShieldCheckIcon /></div>
              <h3>حساب محمي</h3>
              <p>لا يتم تغيير بيانات الدخول الحساسة مباشرة من المتصفح.</p>
            </article>
            <article className={`info-card ${styles.summaryCard}`}>
              <div className="icon-box" aria-hidden="true"><MailIcon /></div>
              <h3>بريد الحساب</h3>
              <p dir="ltr" style={{ overflowWrap: "anywhere" }}>{data.user.email ?? "—"}</p>
            </article>
          </div>

          <div className={`auth-card ${styles.actionCard}`}>
            <div className="auth-card-header">
              <div className="icon-box" aria-hidden="true"><LockIcon /></div>
              <h2>تغيير كلمة المرور</h2>
              <p>أرسل الكود إلى بريدك الحالي ثم عيّن كلمة مرور جديدة.</p>
            </div>
            {passwordError ? <div className="notice notice-error" role="alert">{passwordError}</div> : null}
            <form action={requestPasswordChangeCode}>
              <button className="btn btn-primary" type="submit">إرسال كود تغيير كلمة المرور</button>
            </form>
          </div>

          <div className={`auth-card ${styles.actionCard}`}>
            <div className="auth-card-header">
              <div className="icon-box" aria-hidden="true"><MailIcon /></div>
              <h2>تغيير البريد الإلكتروني</h2>
              <p>أدخل البريد الجديد، ثم أكمل التحقق من البريد الحالي والجديد.</p>
            </div>
            {emailError ? <div className="notice notice-error" role="alert">{emailError}</div> : null}
            <form className="auth-form" action={requestEmailChange}>
              <label className="field" htmlFor="new-account-email">
                <span className="field-label">البريد الإلكتروني الجديد</span>
              </label>
              <div className="auth-input-shell">
                <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
                <input
                  id="new-account-email"
                  name="newEmail"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  placeholder="new@example.com"
                />
              </div>
              <button className="btn btn-primary" type="submit">بدء تغيير البريد</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
