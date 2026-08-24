import Link from "next/link";
import { redirect } from "next/navigation";
import { completeProfile } from "@/app/auth/actions";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { CountryPhoneInput } from "@/src/components/auth/country-phone-input";
import { AlertIcon, UserIcon } from "@/src/components/auth/auth-icons";
import { createClient } from "@/src/lib/supabase/server";

const errorMessages: Record<string, string> = {
  invalid_name: "اكتب اسمًا صحيحًا للمتابعة.",
  invalid_phone: "رقم واتساب غير صالح. استخدم رمز الدولة مثل +249.",
  consent_required: "يجب الموافقة على سياسة الخصوصية وسياسة المتجر.",
  complete_failed: "تعذر حفظ بيانات الحساب. حاول مرة أخرى.",
};

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; consent?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login?error=session_required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.is_active) redirect("/login?error=account_inactive");
  const errorMessage = params.error ? errorMessages[params.error] ?? "تعذر حفظ البيانات." : null;
  const consentFromRegister = params.consent === "1";

  return (
    <AuthScene
      title={
        <>
          أكمل <span>حسابك</span>
        </>
      }
      subtitle="خطوة أخيرة لحماية حسابك وتمكين متابعة الطلبات بصورة صحيحة."
    >
      <section
        className="auth-premium-card auth-premium-card--login"
        aria-labelledby="complete-profile-title"
      >
        <div className="auth-premium-card-head">
          <h2 id="complete-profile-title">إكمال بيانات الحساب</h2>
          <p>أضف رقم واتساب وراجع الموافقات قبل دخول المتجر.</p>
        </div>

        {errorMessage ? (
          <p className="notice notice-error" role="alert">
            <span className="notice-icon" aria-hidden="true">
              <AlertIcon />
            </span>
            <span>{errorMessage}</span>
          </p>
        ) : null}

        <form className="auth-form-stack" action={completeProfile}>
          <div className="field">
            <label className="field-label" htmlFor="profile-name">
              الاسم الكامل
            </label>
            <div className="auth-input-shell">
              <span className="auth-input-icon" aria-hidden="true">
                <UserIcon />
              </span>
              <input
                id="profile-name"
                name="displayName"
                type="text"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                defaultValue={profile.display_name ?? ""}
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          </div>

          <CountryPhoneInput idPrefix="profile" defaultValue={profile.phone ?? undefined} />

          <div className="policy-box">
            <div className="policy-check">
              <input
                id="profile-privacy"
                type="checkbox"
                name="privacyAccepted"
                required
                defaultChecked={consentFromRegister}
              />
              <label htmlFor="profile-privacy">
                أوافق على{" "}
                <Link href="/privacy" target="_blank">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
            <div className="policy-check">
              <input
                id="profile-terms"
                type="checkbox"
                name="termsAccepted"
                required
                defaultChecked={consentFromRegister}
              />
              <label htmlFor="profile-terms">
                أوافق على{" "}
                <Link href="/terms" target="_blank">
                  سياسة المتجر والشروط
                </Link>
              </label>
            </div>
          </div>

          <button className="btn btn-primary btn-full auth-submit" type="submit">
            حفظ ومتابعة
          </button>
        </form>
      </section>
    </AuthScene>
  );
}
