# RAIZEY STORE Supabase email templates

هذه الملفات هي المصدر المعتمد لقوالب البريد الخاصة بالمصادقة

## Confirm sign up

Subject

`رمز تأكيد حسابك في RAIZEY STORE`

Body

`supabase/templates/confirm-signup.html`

## Reset password

Subject

`رمز استعادة كلمة المرور في RAIZEY STORE`

Body

`supabase/templates/reset-password.html`

## Change email address

Subject

`رمز تأكيد تغيير البريد في RAIZEY STORE`

Body

`supabase/templates/change-email.html`

## Reauthentication

Subject

`رمز التحقق الأمني في RAIZEY STORE`

Body

`supabase/templates/reauthentication.html`

## قواعد ثابتة

- استخدم `{{ .Token }}` فقط لرمز التحقق
- لا تستخدم `{{ .ConfirmationURL }}` في هذه القوالب
- الشعار الرسمي فقط من `{{ .SiteURL }}/brand/raizey-store-logo.png`
- اضبط Email OTP Length على 6 أرقام حتى يتطابق البريد مع واجهة الموقع
- اضبط فترة إعادة الإرسال على 60 ثانية
- تأكد أن Site URL يشير إلى نطاق المتجر الفعلي حتى يظهر الشعار في البريد
- لا تستبدل الشعار بنص أو SVG مولد أو أيقونة عامة
