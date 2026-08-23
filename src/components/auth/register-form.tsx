"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { registerWithGoogle, signup } from "@/app/auth/actions";
import { GoogleIcon } from "@/src/components/auth/google-icon";
import { CountryPhoneInput } from "@/src/components/auth/country-phone-input";
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/src/components/auth/auth-icons";

const COMMON_PATTERNS = /(password|123456|qwerty|raizey|admin|letmein)/i;

/** 0..6 display score. Mirrors the shape of the server rules, never replaces them. */
function getPasswordScore(password: string) {
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

/** Four named states, per the approved design. */
function getStrengthLabel(score: number) {
  if (score <= 2) return "ضعيفة";
  if (score <= 4) return "متوسطة";
  if (score === 5) return "قوية";
  return "قوية جدًا";
}

/**
 * Client-side mirror of the server password policy so the CTA is not enabled
 * for input the server will reject. The server remains the authority.
 */
function meetsPolicy(password: string) {
  if (password.length < 10) return false;
  if (COMMON_PATTERNS.test(password)) return false;
  const categories = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password)
  ).length;
  return categories >= 3;
}

const SEGMENTS = [1, 2, 3, 4, 5, 6];

export function RegisterForm({ errorMessage }: { errorMessage?: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const score = useMemo(() => getPasswordScore(password), [password]);
  const strengthLabel = getStrengthLabel(score);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = meetsPolicy(password) && confirmPassword === password;

  return (
    <section className="auth-premium-card auth-premium-card--register" aria-labelledby="register-title">
      <h2 id="register-title" className="sr-only">
        إنشاء حساب جديد
      </h2>

      {errorMessage ? (
        <p className="notice notice-error" role="alert">
          <span className="notice-icon" aria-hidden="true">
            <AlertIcon />
          </span>
          <span>{errorMessage}</span>
        </p>
      ) : null}

      <form className="auth-form-stack" action={signup}>
        <div className="field">
          <label className="field-label" htmlFor="register-name">
            الاسم الكامل
          </label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <UserIcon />
            </span>
            <input
              id="register-name"
              name="displayName"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="أدخل اسمك الكامل"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="register-email">
            البريد الإلكتروني
          </label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <CountryPhoneInput />

        <div className="field">
          <label className="field-label" htmlFor="register-password">
            كلمة المرور
          </label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="أدخل كلمة المرور"
              aria-describedby="register-password-strength"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
              aria-controls="register-password"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div
          id="register-password-strength"
          className="password-strength"
          data-score={score}
          aria-live="polite"
        >
          <div className="password-strength-row">
            <span className="password-strength-label">قوة كلمة المرور</span>
            <span className="password-strength-bars" aria-hidden="true">
              {SEGMENTS.map((segment) => (
                <span key={segment} className={score >= segment ? "is-active" : undefined} />
              ))}
            </span>
            <strong className="password-strength-state">{strengthLabel}</strong>
          </div>
          <small>استخدم أحرفًا كبيرة وصغيرة ورقمًا ورمزًا، و10 أحرف على الأقل.</small>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="register-confirm-password">
            تأكيد كلمة المرور
          </label>
          <div className={`auth-input-shell${mismatch ? " auth-input-shell--error" : ""}`}>
            <span className="auth-input-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={10}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              aria-invalid={mismatch}
              aria-describedby={mismatch ? "register-confirm-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={showConfirm ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
              aria-pressed={showConfirm}
              aria-controls="register-confirm-password"
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {mismatch ? (
            <small id="register-confirm-error" className="field-error" role="alert">
              كلمتا المرور غير متطابقتين.
            </small>
          ) : null}
        </div>

        <div className="policy-box">
          <div className="policy-check">
            <input id="register-privacy" type="checkbox" name="privacyAccepted" required />
            <label htmlFor="register-privacy">
              أوافق على{" "}
              <Link href="/privacy" target="_blank">
                سياسة الخصوصية
              </Link>
            </label>
          </div>
          <div className="policy-check">
            <input id="register-terms" type="checkbox" name="termsAccepted" required />
            <label htmlFor="register-terms">
              أوافق على{" "}
              <Link href="/terms" target="_blank">
                سياسة المتجر والشروط
              </Link>
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full auth-submit"
          type="submit"
          disabled={!canSubmit}
        >
          إنشاء الحساب
        </button>

        <p className="auth-divider">أو</p>

        <button
          className="google-auth-button"
          type="submit"
          formAction={registerWithGoogle}
          formNoValidate
        >
          <span className="google-icon" aria-hidden="true">
            <GoogleIcon />
          </span>
          <span>التسجيل عبر Google</span>
        </button>
      </form>

      <p className="auth-switch">
        <span>لديك حساب بالفعل؟</span>
        <Link className="text-link" href="/login">
          تسجيل الدخول
        </Link>
      </p>
    </section>
  );
}

export default RegisterForm;
