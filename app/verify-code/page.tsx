import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { resendEmailCode, verifyEmailCode } from "@/app/auth/actions";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { AlertIcon, MailIcon } from "@/src/components/auth/auth-icons";

const PENDING_EMAIL_COOKIE = "raizey_pending_email";
const PENDING_PURPOSE_COOKIE = "raizey_pending_purpose";

type Purpose = "signup" | "recovery";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  const hidden = "•".repeat(Math.max(3, Math.min(8, local.length - visible.length)));
  return `${visible}${hidden}@${domain}`;
}

const errorMessages: Record<string, string> = {
  invalid_code: "رمز التحقق غير صحيح. تأكد من الأرقام الستة وحاول مرة أخرى.",
  expired_code: "انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا ثم حاول مرة أخرى.",
  rate_limit: "تم إرسال عدد كبير من الرموز. انتظر قليلًا قبل طلب رمز جديد.",
  resend_failed: "تعذر إعادة إرسال الرمز الآن. حاول مرة أخرى بعد قليل.",
};

const messageTexts: Record<string, string> = {
  sent: "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.",
  resent: "تمت إعادة إرسال رمز التحقق بنجاح.",
  confirmation_required: "حسابك موجود لكنه يحتاج لتأكيد البريد. أدخل الرمز المرسل إليك.",
};

export default async function VerifyCodePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_EMAIL_COOKIE)?.value;
  const rawPurpose = cookieStore.get(PENDING_PURPOSE_COOKIE)?.value;
  const purpose: Purpose | null = rawPurpose === "signup" || rawPurpose === "recovery" ? rawPurpose : null;

  if (!email || !purpose) redirect("/login?error=verification_expired");

  const isRecovery = purpose === "recovery";
  const errorMessage = params.error ? errorMessages[params.error] ?? "تعذر التحقق من الرمز. حاول مرة أخرى." : null;
  const message = params.message ? messageTexts[params.message] ?? null : null;

  return (
    <AuthScene
      title={
        isRecovery ? (
          <>تحقق من <span>هويتك</span></>
        ) : (
          <>أكد <span>بريدك</span></>
        )
      }
      subtitle={
        isRecovery
          ? "أدخل رمز الأمان المكوّن من 6 أرقام قبل تعيين كلمة مرور جديدة."
          : "أدخل رمز التحقق المكوّن من 6 أرقام لإكمال إنشاء حسابك بأمان."
      }
    >
      <section className="auth-premium-card auth-premium-card--login" aria-labelledby="verify-code-title">
        <div className="auth-card-heading">
          <span className="auth-feature-icon" aria-hidden="true"><MailIcon /></span>
          <h2 id="verify-code-title">أدخل رمز التحقق</h2>
          <p>أرسلنا الرمز إلى <strong dir="ltr">{maskEmail(email)}</strong></p>
        </div>

        {message ? <p className="notice" role="status">{message}</p> : null}
        {errorMessage ? (
          <p className="notice notice-error" role="alert">
            <span className="notice-icon" aria-hidden="true"><AlertIcon /></span>
            <span>{errorMessage}</span>
          </p>
        ) : null}

        <form className="auth-form-stack" action={verifyEmailCode}>
          <div className="field">
            <label className="field-label" htmlFor="email-verification-code">رمز التحقق</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
              <input
                id="email-verification-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
                dir="ltr"
                placeholder="123456"
                aria-describedby="verification-code-help"
                style={{ textAlign: "center", letterSpacing: "0.45em", fontSize: "1.35rem", fontWeight: 800 }}
              />
            </div>
            <small id="verification-code-help">الرمز يتكون من 6 أرقام ويُستخدم مرة واحدة فقط.</small>
          </div>

          <button className="btn btn-primary btn-full auth-submit" type="submit">تأكيد الرمز</button>
        </form>

        <form action={resendEmailCode} style={{ marginTop: 14 }}>
          <button className="btn btn-secondary btn-full" type="submit">إعادة إرسال الرمز</button>
        </form>

        <p className="auth-switch">
          <span>{isRecovery ? "تذكرت كلمة المرور؟" : "استخدمت بريدًا آخر؟"}</span>
          <Link className="text-link" href={isRecovery ? "/login" : "/register"}>
            {isRecovery ? "تسجيل الدخول" : "العودة للتسجيل"}
          </Link>
        </p>
      </section>
    </AuthScene>
  );
}
