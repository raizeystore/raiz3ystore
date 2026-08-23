"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signInWithGoogle } from "@/app/auth/actions";
import { GoogleIcon } from "@/src/components/auth/google-icon";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-form-stack">
      <form className="auth-form" action={login}>
        <div className="field">
          <label className="field-label" htmlFor="login-email">البريد الإلكتروني</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">@</span>
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
            <span className="auth-input-icon" aria-hidden="true">●</span>
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
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-controls="login-password"
              aria-pressed={showPassword}
            >
              {showPassword ? "إخفاء" : "إظهار"}
            </button>
          </span>
        </div>

        <div className="form-meta">
          <span className="secure-copy">دخول محمي ومشفّر</span>
          <Link className="text-link" href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>

        <button className="btn btn-primary btn-full auth-submit" type="submit">تسجيل الدخول</button>
      </form>

      <div className="auth-divider">أو</div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/account" />
        <button className="google-auth-button" type="submit">
          <GoogleIcon />
          <span>المتابعة عبر Google</span>
        </button>
      </form>

      <div className="auth-switch">
        <span>ليس لديك حساب؟</span>
        <Link href="/register">إنشاء حساب جديد</Link>
      </div>
    </div>
  );
}
