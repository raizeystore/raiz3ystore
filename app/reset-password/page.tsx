import { redirect } from "next/navigation";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { ResetPasswordForm } from "@/src/components/auth/reset-password-form";
import { createClient } from "@/src/lib/supabase/server";

const errorMessages: Record<string, string> = {
  invalid_password: "تأكد أن كلمتي المرور متطابقتان وأن كلمة المرور قوية وتحتوي 10 أحرف على الأقل.",
  update_failed: "تعذر تحديث كلمة المرور الآن. حاول مرة أخرى بعد قليل.",
};

const successMessages: Record<string, string> = {
  code_verified: "تم التحقق من الرمز بنجاح. يمكنك الآن تعيين كلمة مرور جديدة.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) redirect("/forgot-password?error=request_failed");

  const errorMessage = params.error ? errorMessages[params.error] ?? errorMessages.update_failed : null;
  const successMessage = params.message ? successMessages[params.message] ?? null : null;

  return (
    <AuthScene
      title={<>كلمة مرور <span>جديدة</span></>}
      subtitle="بعد التحقق من رمز البريد، اختر كلمة مرور قوية لحماية حسابك."
    >
      <ResetPasswordForm errorMessage={errorMessage} successMessage={successMessage} />
    </AuthScene>
  );
}
