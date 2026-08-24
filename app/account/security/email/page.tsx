import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyCurrentEmailChangeCode, verifyNewEmailChangeCode } from "@/app/account/security/actions";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { MailIcon } from "@/src/components/auth/auth-icons";
import { createClient } from "@/src/lib/supabase/server";

const EMAIL_CHANGE_OLD = "raizey_email_change_old";
const EMAIL_CHANGE_NEW = "raizey_email_change_new";
const EMAIL_CHANGE_STAGE = "raizey_email_change_stage";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, Math.min(8, local.length - visible.length)))}@${domain}`;
}

const errors: Record<string, string> = {
  invalid_code: "كود التحقق غير صحيح. تأكد من الأرقام الستة وحاول مرة أخرى.",
  expired_code: "انتهت صلاحية الكود. ارجع إلى مركز الأمان وابدأ تغيير البريد من جديد.",
};

const messages: Record<string, string> = {
  codes_sent: "أرسلنا أكواد التحقق. ابدأ بتأكيد بريدك الحالي.",
  current_verified: "تم تأكيد بريدك الحالي. أدخل الآن الكود المرسل إلى البريد الجديد.",
};

export default async function AccountEmailSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?error=session_required");

  const cookieStore = await cookies();
  const oldEmail = cookieStore.get(EMAIL_CHANGE_OLD)?.value;
  const newEmail = cookieStore.get(EMAIL_CHANGE_NEW)?.value;
  const stageValue = cookieStore.get(EMAIL_CHANGE_STAGE)?.value;
  const stage = stageValue === "current" || stageValue === "new" ? stageValue : null;

  if (!oldEmail || !newEmail || !stage) redirect("/account/security?email_error=verification_expired");

  const isCurrent = stage === "current";
  const targetEmail = isCurrent ? oldEmail : newEmail;
  const action = isCurrent ? verifyCurrentEmailChangeCode : verifyNewEmailChangeCode;

  return (
    <AuthScene
      title={isCurrent ? <>أكد بريدك <span>الحالي</span></> : <>أكد بريدك <span>الجديد</span></>}
      subtitle={
        isCurrent
          ? "نؤكد أولًا أنك صاحب الحساب الحالي قبل السماح بتغيير البريد."
          : "بقيت الخطوة الأخيرة: أكد ملكيتك للبريد الجديد ليتم اعتماد التغيير."
      }
    >
      <section className="auth-premium-card auth-premium-card--login" aria-labelledby="email-change-title">
        <div className="auth-card-heading">
          <span className="auth-feature-icon" aria-hidden="true"><MailIcon /></span>
          <h2 id="email-change-title">{isCurrent ? "الكود الأول" : "الكود الثاني"}</h2>
          <p>أدخل الكود المكوّن من 6 أرقام المرسل إلى <strong dir="ltr">{maskEmail(targetEmail)}</strong></p>
        </div>

        {params.message ? <p className="notice" role="status">{messages[params.message] ?? null}</p> : null}
        {params.error ? <p className="notice notice-error" role="alert">{errors[params.error] ?? errors.invalid_code}</p> : null}

        <form className="auth-form-stack" action={action}>
          <div className="field">
            <label className="field-label" htmlFor="email-change-code">كود التحقق</label>
            <div className="auth-input-shell">
              <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
              <input
                id="email-change-code"
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
                style={{ textAlign: "center", letterSpacing: "0.45em", fontSize: "1.35rem", fontWeight: 800 }}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-full auth-submit" type="submit">
            {isCurrent ? "تأكيد البريد الحالي" : "تأكيد البريد الجديد"}
          </button>
        </form>

        <p className="auth-switch">
          <span>تريد إلغاء العملية؟</span>
          <Link className="text-link" href="/account/security">العودة لمركز الأمان</Link>
        </p>
      </section>
    </AuthScene>
  );
}
