# RAIZEY STORE — Supabase Email OTP

RAIZEY STORE uses Supabase Auth's native six-digit email OTP tokens. The application does **not** store custom OTP codes in the database and does **not** expose OTPs in URLs.

## Hosted Supabase settings

Open **Authentication → Providers → Email** and keep email confirmations enabled.

Recommended production settings:

- Confirm email: **Enabled**
- Email OTP length: **6 digits** (Supabase default)
- Email OTP expiration: **600 seconds (10 minutes)**
- Secure email change: **Enabled**

The application stores the pending email/purpose only in short-lived, `HttpOnly`, `SameSite=Lax` cookies and verifies the code with `supabase.auth.verifyOtp()`.

## Email templates

For hosted Supabase projects, open **Authentication → Email Templates**. Replace link-based templates with the code-only templates below.

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

`رمز تأكيد البريد الجديد — RAIZEY STORE`

Body:

```html
<div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;background:#080808;color:#fff;padding:32px;border-radius:18px">
  <h2 style="margin:0 0 12px;color:#ff6a00">RAIZEY STORE</h2>
  <p>استخدم الرمز التالي لتأكيد تغيير البريد الإلكتروني إلى {{ .NewEmail }}:</p>
  <div style="font-size:34px;font-weight:800;letter-spacing:8px;text-align:center;padding:18px;margin:22px 0;border:1px solid #ff6a00;border-radius:14px">{{ .Token }}</div>
  <p style="color:#aaa">إذا لم تطلب تغيير البريد فتجاهل الرسالة واتصل بالدعم إذا لاحظت نشاطًا غير معتاد.</p>
</div>
```

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

## Important

Do not include `{{ .ConfirmationURL }}` in these templates when the desired experience is code-only. Supabase sends a six-digit OTP when `{{ .Token }}` is used.

Google OAuth remains unchanged and continues through `/auth/callback` using PKCE.
