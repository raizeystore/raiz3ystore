"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/../app/auth/actions";
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserPlusIcon,
} from "./auth-icons";

type LoginFormProps = {
  next?: string;
  initialError?: string;
};

export function LoginForm({ next, initialError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-premium-card auth-premium-card--login">
      <header className="auth-premium-card-head">
        <h2>تسجيل الدخول</h2>
        <p>أدخل بياناتك للمتابعة إلى حسابك</p>
      </header>

      {initialError ? (
        <p className="notice notice-error" role="alert">
          <span className="notice-icon" aria-hidden="true">
            <AlertIcon />
          </span>
          <span>{initialError}</span>
        </p>
      ) : null}

      <form className="auth-form-stack" action={signInWithEmail} noValidate>
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
              className="password-toggle password-toggle--icon"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
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
        <UserPlusIcon />
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
          <ShieldIcon />
        </span>
        <span>بياناتك محمية بتقنيات تشفير متقدمة</span>
      </p>
    </div>
  );
}

export default LoginForm;
