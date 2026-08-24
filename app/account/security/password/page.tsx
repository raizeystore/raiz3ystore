import { redirect } from "next/navigation";
import { AuthScene } from "@/src/components/auth/auth-scene";
import { AccountPasswordForm } from "@/src/components/auth/account-password-form";
import { createClient } from "@/src/lib/supabase/server";

const errors: Record<string, string> = {
  invalid_code: "كود التحقق غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا إذا لزم الأمر.",
  invalid_password: "كلمة المرور الجديدة لا تطابق المتطلبات أو كلمتا المرور غير متطابقتين.",
  update_failed: "تعذر تغيير كلمة المرور الآن. حاول مرة أخرى بعد قليل.",
};

const messages: Record<string, string> = {
  code_sent: "أرسلنا كود تحقق من 6 أرقام إلى بريد حسابك.",
};

export default async function AccountPasswordSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?error=session_required");

  return (
    <AuthScene
      title={<>أكد <span>هويتك</span></>}
      subtitle="تغيير كلمة المرور عملية حساسة، لذلك نطلب كود أمان من بريد حسابك قبل تنفيذها."
    >
      <AccountPasswordForm
        errorMessage={params.error ? errors[params.error] ?? errors.update_failed : null}
        successMessage={params.message ? messages[params.message] ?? null : null}
      />
    </AuthScene>
  );
}
