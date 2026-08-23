"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { registerWithGoogle, signup } from "@/app/auth/actions";
import { GoogleIcon } from "@/src/components/auth/google-icon";

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const strengthLabels = ["ابدأ بكتابة كلمة مرور قوية", "ضعيفة", "مقبولة", "جيدة", "قوية جدًا"];

export function RegisterForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const score = useMemo(() => getPasswordScore(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  return (
    <form className="auth-form auth-register-form" action={signup}>
      <div className="auth-form-grid">
        <div className="field">
          <label className="field-label" htmlFor="register-name">الاسم الكامل</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">◎</span>
            <input id="register-name" name="displayName" type="text" required minLength={2} maxLength={120} autoComplete="name" placeholder="اكتب اسمك الكامل" />
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="register-email">البريد الإلكتروني</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">@</span>
            <input id="register-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="name@example.com" />
          </span>
        </div>

        <div className="field auth-grid-span">
          <label className="field-label" htmlFor="register-phone">رقم واتساب</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">☎</span>
            <input id="register-phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" maxLength={24} placeholder="+249XXXXXXXXX" dir="ltr" />
          </span>
          <small className="field-help">اكتب الرقم مع رمز الدولة ليُستخدم في متابعة الطلب عند الحاجة.</small>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="register-password">كلمة المرور</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">●</span>
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="10 أحرف على الأقل"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-controls="register-password"
              aria-pressed={showPassword}
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="register-confirm-password">تأكيد كلمة المرور</label>
          <span className={`auth-input-shell ${passwordsMatch ? "" : "auth-input-shell--error"}`.trim()}>
            <span className="auth-input-icon" aria-hidden="true">●</span>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="أعد كتابة كلمة المرور"
              aria-invalid={!passwordsMatch}
              aria-describedby={!passwordsMatch ? "register-password-match-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={showConfirm ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
              aria-controls="register-confirm-password"
              aria-pressed={showConfirm}
            >
              {showConfirm ? "إخفاء" : "إظهار"}
            </button>
          </span>
          {!passwordsMatch && <small id="register-password-match-error" className="field-error" role="alert">كلمتا المرور غير متطابقتين.</small>}
        </div>
      </div>

      <div className="password-strength" data-score={score} aria-live="polite">
        <div className="password-strength-head">
          <span>قوة كلمة المرور</span>
          <strong>{strengthLabels[score]}</strong>
        </div>
        <div className="password-strength-bars" aria-hidden="true">
          {[1, 2, 3, 4].map((segment) => <span key={segment} className={score >= segment ? "is-active" : ""} />)}
        </div>
        <small>استخدم 10 أحرف أو أكثر مع أحرف كبيرة وصغيرة ورقم ورمز.</small>
      </div>

      <div className="policy-box">
        <label className="policy-check">
          <input type="checkbox" name="privacyAccepted" required />
          <span>أوافق على <Link href="/privacy" target="_blank">سياسة الخصوصية</Link>.</span>
        </label>
        <label className="policy-check">
          <input type="checkbox" name="termsAccepted" required />
          <span>أوافق على <Link href="/terms" target="_blank">سياسة المتجر والشروط</Link>.</span>
        </label>
      </div>

      <button className="btn btn-primary btn-full auth-submit" type="submit" disabled={!passwordsMatch || score < 3}>إنشاء الحساب</button>

      <div className="auth-divider">أو</div>

      <button className="google-auth-button" type="submit" formAction={registerWithGoogle} formNoValidate>
        <GoogleIcon />
        <span>التسجيل عبر Google</span>
      </button>

      <div className="auth-switch">
        <span>لديك حساب بالفعل؟</span>
        <Link href="/login">تسجيل الدخول</Link>
      </div>
    </form>
  );
}
