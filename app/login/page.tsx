import { AuthScene } from "@/src/components/auth/auth-scene";
import { LoginForm } from "@/src/components/auth/login-form";

const errorMessages: Record<string, string> = {
  missing_credentials: "أدخل البريد الإلكتروني وكلمة المرور للمتابعة.",
  invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  email_not_confirmed: "أكد بريدك الإلكتروني أولًا ثم حاول تسجيل الدخول مرة أخرى.",
  auth_failed: "تعذر تسجيل الدخول الآن. حاول مرة أخرى بعد قليل.",
  google_failed: "تعذر إكمال تسجيل الدخول عبر Google. حاول مرة أخرى.",
  confirmation_failed: "رابط التأكيد غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.",
  account_inactive: "هذا الحساب غير متاح حاليًا. تواصل مع دعم المتجر.",
  session_required: "انتهت الجلسة. سجّل الدخول من جديد للمتابعة.",
};

const successMessages: Record<string, string> = {
  check_email: "تم إنشاء الحساب. افتح بريدك الإلكتروني واضغط رابط التأكيد ثم سجّل الدخول.",
  password_updated: "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.",
  login_required: "سجّل الدخول للمتابعة إلى حسابك وطلباتك.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] ?? "تعذر تنفيذ العملية. حاول مرة أخرى." : null;
  const successMessage = params.message ? successMessages[params.message] ?? null : null;

  return (
    <AuthScene
      title={<>مرحبًا <span>بعودتك</span></>}
      subtitle="سجّل دخولك واستمتع بتجربة شحن آمنة وسريعة لألعابك المفضلة."
      features={[
        { title: "دخول آمن", text: "حماية متقدمة لبياناتك", icon: "◇" },
        { title: "تتبّع طلباتك", text: "حالة الطلب لحظة بلحظة", icon: "▣" },
        { title: "شحن سريع", text: "طلبات واضحة وسهلة", icon: "ϟ" },
      ]}
    >
      <section className="auth-premium-card" aria-labelledby="login-title">
        <div className="auth-premium-card-head">
          <span className="card-kicker">RAIZEY ACCOUNT</span>
          <h2 id="login-title">تسجيل الدخول</h2>
          <p>أدخل بيانات حسابك للمتابعة.</p>
        </div>

        {successMessage && <div className="notice" role="status">{successMessage}</div>}
        {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}

        <LoginForm />
        <p className="auth-security-note">بيانات تسجيل الدخول لا تُشارك مع أي طرف، والجلسات تتم عبر Supabase Auth.</p>
      </section>
    </AuthScene>
  );
}
