# RAIZEY STORE — Premium Dark Supabase Email Templates

Approved email direction: **Premium Dark**. These templates use the official RAIZEY STORE production asset at `{{ .SiteURL }}/brand/raizey-store-logo.png` and code-first Supabase OTP via `{{ .Token }}`. Do not replace the logo with generated text, CSS, Lucide, emoji, or another logo.

All templates are intentionally table-based with inline styles for broad email-client compatibility. They do not require JavaScript, external fonts, or a confirmation link.

---

## 1) Confirm signup

**Subject**

`رمز تأكيد حسابك في RAIZEY STORE`

**Body**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background:#070707;color:#ffffff;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#070707;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#101011;border:1px solid #2b2b2d;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);">
            <tr>
              <td style="height:4px;background:#ff6a00;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" style="padding:34px 28px 18px;background:#0c0c0d;">
                <img src="{{ .SiteURL }}/brand/raizey-store-logo.png" width="210" alt="RAIZEY STORE" style="display:block;width:210px;max-width:78%;height:auto;border:0;outline:none;text-decoration:none;object-fit:contain;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:10px 30px 0;">
                <div style="display:inline-block;padding:8px 13px;border:1px solid rgba(255,106,0,.38);border-radius:999px;background:#1b120c;color:#ff8a38;font-size:12px;font-weight:700;">تأكيد البريد الإلكتروني</div>
                <h1 style="margin:18px 0 10px;color:#ffffff;font-size:27px;line-height:1.35;font-weight:800;">أهلاً بك في RAIZEY STORE</h1>
                <p style="margin:0 auto;max-width:470px;color:#b9b6b3;font-size:15px;line-height:1.9;">استخدم رمز التحقق التالي لتأكيد بريدك الإلكتروني وإكمال إنشاء حسابك بأمان.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 30px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#090909;border:1px solid rgba(255,106,0,.55);border-radius:18px;box-shadow:0 0 28px rgba(255,106,0,.10);">
                  <tr>
                    <td align="center" style="padding:14px 18px 5px;color:#87837f;font-size:12px;font-weight:700;">رمز التحقق</td>
                  </tr>
                  <tr>
                    <td align="center" dir="ltr" style="padding:5px 18px 18px;color:#ff791a;font-family:Consolas,'Courier New',monospace;font-size:36px;line-height:1.2;font-weight:800;letter-spacing:8px;white-space:nowrap;">{{ .Token }}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px 8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#151515;border:1px solid #28282a;border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;color:#aaa6a2;font-size:13px;line-height:1.8;">
                      <strong style="color:#f3f1ef;">تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص. فريق RAIZEY STORE لن يطلب منك رمز التحقق عبر الرسائل أو المكالمات.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 30px 34px;color:#75716e;font-size:12px;line-height:1.8;">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذه الرسالة بأمان.<br />RAIZEY STORE • Secure Game Top-up</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2) Reset password / Recovery

**Subject**

`رمز استعادة كلمة المرور — RAIZEY STORE`

**Body**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background:#070707;color:#ffffff;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#070707;">
      <tr><td align="center" style="padding:32px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#101011;border:1px solid #2b2b2d;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);">
          <tr><td style="height:4px;background:#ff6a00;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:34px 28px 18px;background:#0c0c0d;"><img src="{{ .SiteURL }}/brand/raizey-store-logo.png" width="210" alt="RAIZEY STORE" style="display:block;width:210px;max-width:78%;height:auto;border:0;object-fit:contain;" /></td></tr>
          <tr><td align="center" style="padding:10px 30px 0;"><div style="display:inline-block;padding:8px 13px;border:1px solid rgba(255,106,0,.38);border-radius:999px;background:#1b120c;color:#ff8a38;font-size:12px;font-weight:700;">استعادة الحساب</div><h1 style="margin:18px 0 10px;color:#fff;font-size:27px;line-height:1.35;font-weight:800;">إعادة تعيين كلمة المرور</h1><p style="margin:0 auto;max-width:470px;color:#b9b6b3;font-size:15px;line-height:1.9;">تلقينا طلبًا لإعادة تعيين كلمة المرور. أدخل الرمز التالي داخل صفحة التحقق في الموقع.</p></td></tr>
          <tr><td style="padding:26px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#090909;border:1px solid rgba(255,106,0,.55);border-radius:18px;box-shadow:0 0 28px rgba(255,106,0,.10);"><tr><td align="center" style="padding:14px 18px 5px;color:#87837f;font-size:12px;font-weight:700;">رمز الاستعادة</td></tr><tr><td align="center" dir="ltr" style="padding:5px 18px 18px;color:#ff791a;font-family:Consolas,'Courier New',monospace;font-size:36px;line-height:1.2;font-weight:800;letter-spacing:8px;white-space:nowrap;">{{ .Token }}</td></tr></table></td></tr>
          <tr><td style="padding:18px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#151515;border:1px solid #28282a;border-radius:14px;"><tr><td style="padding:16px 18px;color:#aaa6a2;font-size:13px;line-height:1.8;"><strong style="color:#f3f1ef;">مهم:</strong> لا ترسل هذا الرمز لأي شخص. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل الرسالة وراجع أمان حسابك إذا لاحظت أي نشاط غير معتاد.</td></tr></table></td></tr>
          <tr><td align="center" style="padding:18px 30px 34px;color:#75716e;font-size:12px;line-height:1.8;">RAIZEY STORE • حماية حسابك أولويتنا</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
```

---

## 3) Change email address

**Subject**

`رمز تأكيد تغيير البريد — RAIZEY STORE`

**Body**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background:#070707;color:#ffffff;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#070707;">
      <tr><td align="center" style="padding:32px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#101011;border:1px solid #2b2b2d;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);">
          <tr><td style="height:4px;background:#ff6a00;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:34px 28px 18px;background:#0c0c0d;"><img src="{{ .SiteURL }}/brand/raizey-store-logo.png" width="210" alt="RAIZEY STORE" style="display:block;width:210px;max-width:78%;height:auto;border:0;object-fit:contain;" /></td></tr>
          <tr><td align="center" style="padding:10px 30px 0;"><div style="display:inline-block;padding:8px 13px;border:1px solid rgba(255,106,0,.38);border-radius:999px;background:#1b120c;color:#ff8a38;font-size:12px;font-weight:700;">أمان الحساب</div><h1 style="margin:18px 0 10px;color:#fff;font-size:27px;line-height:1.35;font-weight:800;">تأكيد تغيير البريد الإلكتروني</h1><p style="margin:0 auto;max-width:470px;color:#b9b6b3;font-size:15px;line-height:1.9;">هناك طلب لتغيير البريد الإلكتروني المرتبط بحسابك. استخدم الرمز التالي داخل مركز أمان الحساب لإكمال مرحلة التحقق المطلوبة.</p></td></tr>
          <tr><td style="padding:26px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#090909;border:1px solid rgba(255,106,0,.55);border-radius:18px;box-shadow:0 0 28px rgba(255,106,0,.10);"><tr><td align="center" style="padding:14px 18px 5px;color:#87837f;font-size:12px;font-weight:700;">رمز تأكيد البريد</td></tr><tr><td align="center" dir="ltr" style="padding:5px 18px 18px;color:#ff791a;font-family:Consolas,'Courier New',monospace;font-size:36px;line-height:1.2;font-weight:800;letter-spacing:8px;white-space:nowrap;">{{ .Token }}</td></tr></table></td></tr>
          <tr><td style="padding:18px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#1a1111;border:1px solid #4b2828;border-radius:14px;"><tr><td style="padding:16px 18px;color:#d9aaa8;font-size:13px;line-height:1.8;"><strong style="color:#ffcdca;">لم تطلب هذا التغيير؟</strong> لا تستخدم الرمز، ولا تشاركه مع أي شخص، وراجع مركز أمان حسابك فورًا.</td></tr></table></td></tr>
          <tr><td align="center" style="padding:18px 30px 34px;color:#75716e;font-size:12px;line-height:1.8;">مع Secure Email Change قد يصلك رمز للبريد الحالي ورمز آخر للبريد الجديد، وهذا سلوك أمني مقصود.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
```

---

## 4) Reauthentication

**Subject**

`رمز التحقق الأمني — RAIZEY STORE`

**Body**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background:#070707;color:#ffffff;font-family:Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#070707;">
      <tr><td align="center" style="padding:32px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#101011;border:1px solid #2b2b2d;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);">
          <tr><td style="height:4px;background:#ff6a00;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:34px 28px 18px;background:#0c0c0d;"><img src="{{ .SiteURL }}/brand/raizey-store-logo.png" width="210" alt="RAIZEY STORE" style="display:block;width:210px;max-width:78%;height:auto;border:0;object-fit:contain;" /></td></tr>
          <tr><td align="center" style="padding:10px 30px 0;"><div style="display:inline-block;padding:8px 13px;border:1px solid rgba(255,106,0,.38);border-radius:999px;background:#1b120c;color:#ff8a38;font-size:12px;font-weight:700;">تحقق أمني</div><h1 style="margin:18px 0 10px;color:#fff;font-size:27px;line-height:1.35;font-weight:800;">أكد هويتك للمتابعة</h1><p style="margin:0 auto;max-width:470px;color:#b9b6b3;font-size:15px;line-height:1.9;">لحماية حسابك، نحتاج إلى رمز تحقق قبل تنفيذ العملية الحساسة المطلوبة.</p></td></tr>
          <tr><td style="padding:26px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#090909;border:1px solid rgba(255,106,0,.55);border-radius:18px;box-shadow:0 0 28px rgba(255,106,0,.10);"><tr><td align="center" style="padding:14px 18px 5px;color:#87837f;font-size:12px;font-weight:700;">رمز التحقق الأمني</td></tr><tr><td align="center" dir="ltr" style="padding:5px 18px 18px;color:#ff791a;font-family:Consolas,'Courier New',monospace;font-size:36px;line-height:1.2;font-weight:800;letter-spacing:8px;white-space:nowrap;">{{ .Token }}</td></tr></table></td></tr>
          <tr><td style="padding:18px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#151515;border:1px solid #28282a;border-radius:14px;"><tr><td style="padding:16px 18px;color:#aaa6a2;font-size:13px;line-height:1.8;"><strong style="color:#f3f1ef;">لا تشارك الرمز.</strong> استخدمه فقط داخل موقع RAIZEY STORE لإكمال العملية التي بدأت بها أنت.</td></tr></table></td></tr>
          <tr><td align="center" style="padding:18px 30px 34px;color:#75716e;font-size:12px;line-height:1.8;">RAIZEY STORE • جلسات آمنة وعمليات محمية</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
```

## Notes

- Keep `{{ .Token }}` exactly as written.
- Do not add `{{ .ConfirmationURL }}` to these code-first flows.
- The official logo remains readable because the email card uses the approved dark background.
- If a mail client blocks images, the `alt="RAIZEY STORE"` text remains available; this is accessibility fallback, not a replacement logo.
- Keep Supabase Site URL pointed at the production RAIZEY STORE origin so `{{ .SiteURL }}/brand/raizey-store-logo.png` resolves correctly.
