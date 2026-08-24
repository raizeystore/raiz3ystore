"use client";

import { useMemo, useState } from "react";
import { confirmPasswordChange } from "@/app/account/security/actions";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/src/components/auth/auth-icons";

const COMMON_PATTERNS = /(password|123456|qwerty|raizey|admin|letmein)/i;
const SEGMENTS = [1, 2, 3, 4, 5, 6];

function scorePassword(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 10 && !COMMON_PATTERNS.test(password)) score++;
  return Math.min(score, 6);
}

function isStrong(password: string) {
  if (password.length < 10 || COMMON_PATTERNS.test(password)) return false;
  const categories = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
  return categories >= 3;
}

function strengthLabel(score: number) {
  if (score <= 2) return "ضعيفة";
  if (score <= 4) return "متوسطة";
  if (score === 5) return "قوية";
  return "قوية جدًا";
}

export function AccountPasswordForm({ errorMessage, successMessage }: { errorMessage?: string | null; successMessage?: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const score = useMemo(() => scorePassword(password), [password]);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = isStrong(password) && password === confirmPassword;

  return (
    <section className="auth-premium-card auth-premium-card--login" aria-labelledby="change-password-title">
      <div className="auth-card-heading">
        <span className="auth-feature-icon" aria-hidden="true"><LockIcon /></span>
        <h2 id="change-password-title">تغيير كلمة المرور</h2>
        <p>أدخل الكود المرسل إلى بريدك ثم اختر كلمة مرور جديدة وقوية.</p>
      </div>

      {successMessage ? <p className="notice" role="status">{successMessage}</p> : null}
      {errorMessage ? <p className="notice notice-error" role="alert">{errorMessage}</p> : null}

      <form className="auth-form-stack" action={confirmPasswordChange}>
        <div className="field">
          <label className="field-label" htmlFor="security-password-code">كود التحقق</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
            <input
              id="security-password-code"
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
              style={{ textAlign: "center", letterSpacing: "0.4em", fontWeight: 800 }}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="security-new-password">كلمة المرور الجديدة</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true"><LockIcon /></span>
            <input
              id="security-new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby="security-password-strength"
              placeholder="أدخل كلمة المرور الجديدة"
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"} aria-pressed={showPassword}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div id="security-password-strength" className="password-strength" data-score={score} aria-live="polite">
          <div className="password-strength-row">
            <span className="password-strength-label">قوة كلمة المرور</span>
            <span className="password-strength-bars" aria-hidden="true">
              {SEGMENTS.map((segment) => <span key={segment} className={score >= segment ? "is-active" : undefined} />)}
            </span>
            <strong className="password-strength-state">{strengthLabel(score)}</strong>
          </div>
          <small>10 أحرف على الأقل مع 3 أنواع من الأحرف، وتجنب الكلمات الشائعة.</small>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="security-confirm-password">تأكيد كلمة المرور</label>
          <div className={`auth-input-shell${mismatch ? " auth-input-shell--error" : ""}`}>
            <span className="auth-input-icon" aria-hidden="true"><LockIcon /></span>
            <input
              id="security-confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={mismatch}
              placeholder="أعد إدخال كلمة المرور الجديدة"
            />
            <button type="button" className="password-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"} aria-pressed={showConfirm}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {mismatch ? <small className="field-error">كلمتا المرور غير متطابقتين.</small> : null}
        </div>

        <button className="btn btn-primary btn-full auth-submit" type="submit" disabled={!canSubmit}>تأكيد وتغيير كلمة المرور</button>
      </form>
    </section>
  );
}

export default AccountPasswordForm;
