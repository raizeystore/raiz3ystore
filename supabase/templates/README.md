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

- استخدم `{{ .Token }}` وحده لرمز التحقق
- Supabase يوثق `{{ .Token }}` كرمز بريد مكون من 6 أرقام
- لا تضف أي أرقام ثابتة قبل المتغير أو بعده
- لا تستخدم `{{ .ConfirmationURL }}` في هذه القوالب
- الشعار الرسمي فقط من `{{ .SiteURL }}/brand/raizey-store-logo.png`
- Minimum interval per user يبقى 60 ثانية
- Confirm Email يبقى مفعلاً
- Secure Email Change يبقى مفعلاً
- Site URL يجب أن يشير إلى نطاق المتجر الفعلي حتى يظهر الشعار في البريد
- لا تستبدل الشعار بنص أو SVG مولد أو أيقونة عامة

إذا ظهر رمز أطول من 6 أرقام بعد استخدام هذه الملفات فراجع القالب الموجود في Dashboard وتأكد أن خانة الرمز تحتوي `{{ .Token }}` فقط بدون أرقام إضافية
