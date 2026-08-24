"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signInWithGoogle } from "@/app/auth/actions";
import { GoogleIcon } from "@/src/components/auth/google-icon";
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserPlusIcon,
} from "@/src/components/auth/auth-icons";

type LoginFormProps = {
  next?: string;
  errorMessage?: string | null;
  successMessage?: string | null;
};

/**
 * The single, final login card. The page passes resolved Arabic copy in —
 * it must not wrap this component in another card.
 */
export function LoginForm({ next, errorMessage, successMessage }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="auth-premium-card auth-premium-card--login" aria-labelledby="login-title">
      <header className="auth-premium-card-head">
        <h2 id="login-title">تسجيل الدخول</h2>
        <p>أدخل بياناتك للمتابعة إلى حسابك</p>
      </header>

      {successMessage ? (
        <p className="notice notice-success" role="status">
          <span>{successMessage}</span>
        </p>
      ) : null}

      {errorMessage ? (
        <p className="notice notice-error" role="alert">
          <span className="notice-icon" aria-hidden="true">
            <AlertIcon />
          </span>
          <span>{errorMessage}</span>
        </p>
      ) : null}

      <form className="auth-form-stack" action={login}>
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div className="field">
          <label className="field-label" htmlFor="login-email">
            البريد الإلكتروني
          </label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              required
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-password">
            كلمة المرور
          </label>
          <div className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="أدخل كلمة المرور"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
              aria-controls="login-password"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="form-meta form-meta--login">
          <Link className="text-link" href="/forgot-password">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button className="btn btn-primary btn-full auth-submit" type="submit">
          تسجيل الدخول
        </button>
      </form>

      <Link className="auth-secondary-action" href="/register">
        <UserPlusIcon aria-hidden="true" />
        <span>إنشاء حساب جديد</span>
      </Link>

      <p className="auth-divider">أو</p>

      <form action={signInWithGoogle}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button className="google-auth-button" type="submit">
          <span className="google-icon" aria-hidden="true">
            <GoogleIcon />
          </span>
          <span>المتابعة عبر Google</span>
        </button>
      </form>

      <p className="auth-security-note">
        <span className="auth-security-note-icon" aria-hidden="true">
          <LockIcon />
        </span>
        <span>بياناتك محمية بتقنيات تشفير متقدمة</span>
      </p>
    </section>
  );
}

export default LoginForm;
