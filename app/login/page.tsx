import { login, signup } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h1>تسجيل الدخول</h1>
      {params.message === "check_email" && <p>تحقق من بريدك الإلكتروني لتأكيد الحساب.</p>}
      {params.error && <p role="alert">تعذر تنفيذ العملية. حاول مرة أخرى.</p>}

      <form style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <label>
          البريد الإلكتروني
          <input name="email" type="email" required autoComplete="email" style={{ width: "100%" }} />
        </label>
        <label>
          كلمة المرور
          <input name="password" type="password" required minLength={8} autoComplete="current-password" style={{ width: "100%" }} />
        </label>
        <button formAction={login} type="submit">دخول</button>
        <button formAction={signup} type="submit">إنشاء حساب</button>
      </form>
    </main>
  );
}
