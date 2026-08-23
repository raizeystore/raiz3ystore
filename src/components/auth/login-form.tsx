"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signInWithGoogle } from "@/app/auth/actions";
import { GoogleIcon } from "@/src/components/auth/google-icon";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserPlusIcon } from "@/src/components/auth/auth-icons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-form-stack">
      <form className="auth-form" action={login}>
        <div className="field">
          <label className="field-label" htmlFor="login-email">البريد الإلكتروني</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true"><MailIcon /></span>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
            />
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-password">كلمة المرور</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true"><LockIcon /></span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="أدخل كلمة المرور"
            />
            <button
              type="button"
              className="password-toggle password-toggle--icon"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
              aria-controls="login-password"
              title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </span>
        </div>

        <div className="form-meta form-meta--login">
          <span className="secure-copy">دخول محمي ومشفّر</span>
          <Link className="text-link" href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>

        <button className="btn btn-primary btn-full auth-submit" type="submit">تسجيل الدخول</button>
      </form>

      <Link className="auth-secondary-action" href="/register">
        <UserPlusIcon />
        <span>إنشاء حساب جديد</span>
      </Link>

      <div className="auth-divider">أو</div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/account" />
        <button className="google-auth-button" type="submit">
          <GoogleIcon />
          <span>المتابعة عبر Google</span>
        </button>
      </form>
    </div>
  );
}
