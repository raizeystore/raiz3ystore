import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { AlertIcon, MailIcon } from "@/src/components/auth/auth-icons";

const errorMessages: Record<string, string> = {
  invalid_email: "أدخل بريدًا إلكترونيًا صالحًا للمتابعة",
  rate_limit: "تم إرسال عدد كبير من الطلبات انتظر قليلًا ثم حاول مرة أخرى",
  request_failed: "تعذر إرسال رمز الاسترجاع الآن حاول مرة أخرى بعد قليل",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] ?? errorMessages.request_failed : null;

  return (
    <AuthScene
      title={<>استعد <span>حسابك</span></>}
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز أمان من 6 أرقام لإعادة تعيين كلمة المرور"
    >
      <section className="auth-premium-card auth-premium-card--login" aria-labelledby="forgot-title">
        <div className="auth-card-heading">
          <span className="auth-feature-icon" aria-hidden="true"><MailIcon /></span>
          <h2 id="forgot-title">نسيت كلمة المرور</h2>
          <p>لن نرسل رابطًا وستصلك رسالة تحتوي على رمز تحقق مكون من 6 أرقام</p>
        </div>

        {errorMessage ? (
          <p className="notice notice-error" role="alert">
            <span className="notice-icon" aria-hidden="true"><AlertIcon /></span>
            <span>{errorMessage}</span>
          </p>
        ) : null}

        <form className="auth-form-stack" action={requestPasswordReset}>
          <div className="field">
            <label className="field-label" htmlFor="recovery-email">البريد الإلكتروني</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
              <input
                id="recovery-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                dir="ltr"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <button className="btn btn-primary btn-full auth-submit" type="submit">إرسال رمز التحقق</button>
        </form>

        <p className="auth-switch">
          <span>تذكرت كلمة المرور</span>
          <Link className="text-link" href="/login">العودة لتسجيل الدخول</Link>
        </p>
      </section>
    </AuthScene>
  );
}
