"use client";

import { useMemo, useState } from "react";
import { updatePassword } from "@/app/auth/actions";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon } from "@/src/components/auth/auth-icons";

const COMMON_PATTERNS = /(password|123456|qwerty|raizey|admin|letmein)/i;

function passwordScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 10 && !COMMON_PATTERNS.test(password)) score += 1;
  return Math.min(score, 6);
}

function meetsPolicy(password: string) {
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

const SEGMENTS = [1, 2, 3, 4, 5, 6];

export function ResetPasswordForm({
  errorMessage,
  successMessage,
}: {
  errorMessage?: string | null;
  successMessage?: string | null;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = meetsPolicy(password) && password === confirmPassword;

  return (
    <section className="auth-premium-card auth-premium-card--login" aria-labelledby="reset-title">
      <div className="auth-card-heading">
        <span className="auth-feature-icon" aria-hidden="true"><LockIcon /></span>
        <h2 id="reset-title">عيّن كلمة مرور جديدة</h2>
        <p>اختر كلمة مرور قوية من 10 أحرف على الأقل، ثم أكدها مرة ثانية.</p>
      </div>

      {successMessage ? <p className="notice" role="status">{successMessage}</p> : null}
      {errorMessage ? (
        <p className="notice notice-error" role="alert">
          <span className="notice-icon" aria-hidden="true"><AlertIcon /></span>
          <span>{errorMessage}</span>
        </p>
      ) : null}

      <form className="auth-form-stack" action={updatePassword}>
        <div className="field">
          <label className="field-label" htmlFor="new-password">كلمة المرور الجديدة</label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true"><LockIcon /></span>
            <input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby="reset-password-strength"
              placeholder="أدخل كلمة المرور الجديدة"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
              aria-pressed={showPassword}
              aria-controls="new-password"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div id="reset-password-strength" className="password-strength" data-score={score} aria-live="polite">
          <div className="password-strength-row">
            <span className="password-strength-label">قوة كلمة المرور</span>
            <span className="password-strength-bars" aria-hidden="true">
              {SEGMENTS.map((segment) => (
                <span key={segment} className={score >= segment ? "is-active" : undefined} />
              ))}
            </span>
            <strong className="password-strength-state">{strengthLabel(score)}</strong>
          </div>
          <small>استخدم أحرفًا كبيرة وصغيرة ورقمًا ورمزًا، وتجنب الكلمات الشائعة.</small>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="confirm-new-password">تأكيد كلمة المرور</label>
          <div className={`auth-input-shell${mismatch ? " auth-input-shell--error" : ""}`}>
            <span className="auth-input-icon" aria-hidden="true"><LockIcon /></span>
            <input
              id="confirm-new-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={mismatch}
              aria-describedby={mismatch ? "reset-confirm-error" : undefined}
              placeholder="أعد إدخال كلمة المرور الجديدة"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={showConfirm ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
              aria-pressed={showConfirm}
              aria-controls="confirm-new-password"
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {mismatch ? <small id="reset-confirm-error" className="field-error">كلمتا المرور غير متطابقتين.</small> : null}
        </div>

        <button className="btn btn-primary btn-full auth-submit" type="submit" disabled={!canSubmit}>
          حفظ كلمة المرور الجديدة
        </button>
      </form>
    </section>
  );
}

export default ResetPasswordForm;
