import { AuthScene } from "@/src/components/auth/auth-scene";
import { RegisterForm } from "@/src/components/auth/register-form";

const errorMessages: Record<string, string> = {
  invalid_signup: "تحقق من الاسم والبريد الإلكتروني ثم حاول مرة أخرى.",
  invalid_phone: "رقم واتساب غير صالح. اختر الدولة الصحيحة وأدخل رقمك المحلي كاملًا.",
  password_mismatch: "كلمتا المرور غير متطابقتين.",
  weak_password: "كلمة المرور غير قوية بما يكفي. استخدم 10 أحرف على الأقل ومزيجًا متنوعًا.",
  consent_required: "يجب الموافقة على سياسة الخصوصية وسياسة المتجر قبل إنشاء الحساب.",
  email_rate_limit: "تم طلب رسالة تأكيد قبل قليل. انتظر دقيقة ثم حاول مرة أخرى.",
  signup_failed: "تعذر إنشاء الحساب الآن. قد يكون البريد مستخدمًا أو حدث خطأ مؤقت.",
  google_failed: "تعذر بدء التسجيل عبر Google. حاول مرة أخرى.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] ?? "تعذر إنشاء الحساب. حاول مرة أخرى." : null;

  return (
    <AuthScene
      title={<>أنشئ <span>حسابك</span></>}
      subtitle="انضم إلى RAIZEY STORE واستمتع بتجربة شحن آمنة وسريعة وخدمات مصممة للاعبين."
    >
      <section className="auth-premium-card auth-premium-card--wide" aria-labelledby="register-title">
        <div className="auth-premium-card-head">
          <h2 id="register-title">إنشاء حساب جديد</h2>
          <p>أدخل بياناتك الصحيحة، واختر دولة رقم واتساب لضمان حفظ الرقم بالصيغة الدولية الصحيحة.</p>
        </div>

        {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
        <RegisterForm />
        <p className="auth-security-note">بياناتك محمية بأعلى معايير الأمان ولن نشاركها مع أي طرف ثالث.</p>
      </section>
    </AuthScene>
  );
}
