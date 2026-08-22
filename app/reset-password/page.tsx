import Link from "next/link";
import { redirect } from "next/navigation";
import { updatePassword } from "@/app/auth/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) redirect("/login?error=session_required");

  return (
    <main className="auth-shell auth-shell--single">
      <section className="auth-form-panel" aria-labelledby="reset-title">
        <div className="auth-card">
          <div className="auth-card-header">
            <Link href="/" aria-label="العودة إلى الصفحة الرئيسية">
              <BrandLogo compact />
            </Link>
            <span className="eyebrow"><span className="eyebrow-dot" />تحديث كلمة المرور</span>
            <h1 id="reset-title">عيّن كلمة مرور جديدة</h1>
            <p>استخدم كلمة مرور قوية لا تقل عن 8 أحرف، ويفضل ألا تكون مستخدمة في حساب آخر.</p>
          </div>

          {params.error && (
            <div className="notice notice-error" role="alert">تأكد أن كلمتي المرور متطابقتان ولا تقلان عن 8 أحرف.</div>
          )}

          <form className="auth-form" action={updatePassword}>
            <label className="field">
              <span className="field-label">كلمة المرور الجديدة</span>
              <input name="password" type="password" required minLength={8} autoComplete="new-password" />
            </label>

            <label className="field">
              <span className="field-label">تأكيد كلمة المرور</span>
              <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
            </label>

            <button className="btn btn-primary btn-full" type="submit">حفظ كلمة المرور الجديدة</button>
          </form>

          <p className="auth-footnote">بعد الحفظ سيتم تسجيل خروجك وإعادتك لصفحة الدخول لحماية الحساب.</p>
        </div>
      </section>
    </main>
  );
}
