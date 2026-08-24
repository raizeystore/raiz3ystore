import { AuthScene } from "@/src/components/auth/auth-scene";
import { RegisterForm } from "@/src/components/auth/register-form";

const errorMessages: Record<string, string> = {
  invalid_signup: "تحقق من الاسم والبريد الإلكتروني ثم حاول مرة أخرى.",
  invalid_phone: "رقم واتساب غير صالح. تأكد من الدولة والرقم ثم حاول مرة أخرى.",
  password_mismatch: "كلمتا المرور غير متطابقتين.",
  weak_password: "كلمة المرور ضعيفة. استخدم 10 أحرف على الأقل مع أحرف وأرقام ورموز.",
  consent_required: "يجب الموافقة على سياسة الخصوصية وسياسة المتجر والشروط للمتابعة.",
  duplicate_signup: "هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول أو استعد كلمة المرور.",
  email_rate_limit: "تم إرسال عدد كبير من الرسائل. انتظر قليلًا ثم حاول مرة أخرى.",
  signup_failed: "تعذر إنشاء الحساب الآن. حاول مرة أخرى بعد قليل.",
  google_failed: "تعذر إكمال التسجيل عبر Google. حاول مرة أخرى.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error
    ? errorMessages[params.error] ?? "تعذر تنفيذ العملية. تحقق من البيانات أو حاول مرة أخرى."
    : null;

  return (
    <AuthScene
      title={
        <>
          <span>أنشئ</span> حسابك
        </>
      }
      subtitle="انضم إلى متجر ريزي واستمتع بتجربة شحن آمنة وسريعة وخدمات مميزة مصممة للاعبين."
    >
      <RegisterForm errorMessage={errorMessage} />
    </AuthScene>
  );
}
