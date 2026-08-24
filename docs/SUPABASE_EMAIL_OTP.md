# RAIZEY STORE — Supabase Email OTP

RAIZEY STORE uses Supabase Auth's native six-digit email OTP tokens for email verification and sensitive-account confirmation. The application does **not** store custom OTP codes in the database and does **not** expose OTP values in URLs.

## Security model

- OTP length: **6 numeric digits**.
- Pending verification state is kept only in short-lived `HttpOnly`, `SameSite=Lax` cookies.
- Cookies are also `Secure` in production.
- Verification pages and account-security pages use `Cache-Control: private, no-store, max-age=0`.
- OTP verification is delegated to Supabase Auth with `verifyOtp()` or the documented reauthentication nonce flow.
- Google OAuth remains separate and continues through `/auth/callback` using PKCE.

## Application flows

### New account

1. User submits the registration form.
2. `supabase.auth.signUp()` creates the pending account.
3. The app stores the pending email and `signup` purpose in short-lived `HttpOnly` cookies.
4. User is redirected to `/verify-code`.
5. User enters the six-digit token from the signup email.
6. The server verifies the token with `supabase.auth.verifyOtp()`.
7. After successful verification, the user proceeds to the completed account flow.

### Forgotten password

1. User enters their email on `/forgot-password`.
2. The server calls `supabase.auth.resetPasswordForEmail(email)`.
3. The pending email and `recovery` purpose are stored in short-lived `HttpOnly` cookies.
4. User enters the six-digit recovery token on `/verify-code`.
5. Supabase verifies the recovery OTP and establishes the recovery session.
6. User is redirected to `/reset-password` and chooses a new password.

The user-facing flow does not require clicking a reset link.

### Password change while signed in

1. User opens `/account/security`.
2. The server calls `supabase.auth.reauthenticate()`.
3. Supabase sends a six-digit reauthentication nonce to the current account email.
4. User opens `/account/security/password`, enters the nonce and the new password twice.
5. The server calls `supabase.auth.updateUser({ password, nonce })`.
6. On success the current session is signed out and the user must sign in with the new password.

This is intentionally separate from the forgotten-password recovery flow.

### Secure email change while signed in

**Secure Email Change must remain enabled in Supabase.** The app treats changing an email address as a two-stage operation:

1. User submits the new email from `/account/security`.
2. The server calls `supabase.auth.updateUser({ email: newEmail })`.
3. Supabase sends confirmation codes for the secure email-change flow.
4. The app stores only the old email, new email and current verification stage in short-lived `HttpOnly` cookies.
5. `/account/security/email` first asks for the code delivered to the **current email**.
6. After that succeeds, the same page asks for the code delivered to the **new email**.
7. The email change is considered complete only after both stages succeed.

Do not disable Secure Email Change to simplify this flow. The two-email confirmation is intentional protection against account takeover.

## Hosted Supabase settings

Open **Authentication → Providers → Email** and use these settings:

- Confirm email: **Enabled**
- Email OTP length: **6 digits**
- Email OTP expiration: **600 seconds (10 minutes)**
- Secure Email Change: **Enabled**
- Reauthentication for sensitive password changes: **Enabled** when available in the hosted Auth settings

Also keep the normal Supabase Auth rate limits enabled. Do not add a client-side resend loop that bypasses or weakens those limits.

## Email templates

For hosted Supabase projects, open **Authentication → Email Templates**. The RAIZEY experience is code-first, so authentication templates used by these flows should display `{{ .Token }}` rather than requiring the customer to click `{{ .ConfirmationURL }}`.

### Confirm signup

Subject:

`رمز تأكيد حسابك في RAIZEY STORE`

Body:

```html
<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#080808;color:#fff;padding:32px;border-radius:18px">
  <h2 style="margin:0 0 12px;color:#ff6a00">RAIZEY STORE</h2>
  <p>استخدم رمز التحقق التالي لتأكيد بريدك وإكمال إنشاء الحساب:</p>
  <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;margin:22px 0;border:1px solid #ff6a00;border-radius:14px">{{ .Token }}</div>
  <p style="color:#aaa">الرمز للاستخدام مرة واحدة فقط. إذا لم تطلب إنشاء الحساب فتجاهل الرسالة.</p>
</div>
```

### Reset password / Recovery

Subject:

`رمز استعادة كلمة المرور — RAIZEY STORE`

Body:

```html
<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#080808;color:#fff;padding:32px;border-radius:18px">
  <h2 style="margin:0 0 12px;color:#ff6a00">RAIZEY STORE</h2>
  <p>استلمنا طلبًا لإعادة تعيين كلمة المرور. أدخل رمز الأمان التالي داخل الموقع:</p>
  <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;margin:22px 0;border:1px solid #ff6a00;border-radius:14px">{{ .Token }}</div>
  <p style="color:#aaa">لا تشارك الرمز مع أي شخص. إذا لم تطلب إعادة التعيين فتجاهل الرسالة.</p>
</div>
```

### Change email address

Subject:

`رمز تأكيد تغيير البريد — RAIZEY STORE`

Body:

```html
<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#080808;color:#fff;padding:32px;border-radius:18px">
  <h2 style="margin:0 0 12px;color:#ff6a00">RAIZEY STORE</h2>
  <p>هناك طلب لتغيير البريد الإلكتروني المرتبط بحسابك.</p>
  <p>استخدم رمز التحقق التالي داخل صفحة أمان الحساب:</p>
  <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;margin:22px 0;border:1px solid #ff6a00;border-radius:14px">{{ .Token }}</div>
  <p style="color:#aaa">إذا لم تطلب تغيير البريد، لا تستخدم الرمز وراجع حسابك فورًا.</p>
</div>
```

With Secure Email Change enabled, Supabase may generate separate confirmations for the current and new email. The application deliberately presents them as two verification stages.

### Reauthentication

Subject:

`{{ .Token }} هو رمز التحقق — RAIZEY STORE`

Body:

```html
<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#080808;color:#fff;padding:32px;border-radius:18px">
  <h2 style="margin:0 0 12px;color:#ff6a00">RAIZEY STORE</h2>
  <p>استخدم رمز التحقق التالي لتأكيد العملية الحساسة:</p>
  <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;margin:22px 0;border:1px solid #ff6a00;border-radius:14px">{{ .Token }}</div>
  <p style="color:#aaa">لا تشارك هذا الرمز مع أي شخص.</p>
</div>
```

## Production checklist

Before merging the authentication redesign into `main`:

- [ ] Hosted signup template contains `{{ .Token }}`.
- [ ] Hosted recovery template contains `{{ .Token }}`.
- [ ] Hosted email-change template contains `{{ .Token }}`.
- [ ] Hosted reauthentication template contains `{{ .Token }}`.
- [ ] Secure Email Change is enabled.
- [ ] Email confirmations are enabled.
- [ ] A real signup OTP is received and accepted.
- [ ] A real recovery OTP is received and accepted.
- [ ] A real signed-in password-change nonce is received and accepted.
- [ ] Secure email change is tested with both current and new email confirmation stages.
- [ ] CI, TypeScript, production build and Playwright all pass on the final branch head.

## Important

Do not add `{{ .ConfirmationURL }}` back to these code-first templates unless the product intentionally returns to a link-based flow. Supabase exposes the six-digit OTP through `{{ .Token }}` and the application is designed around direct code entry.
