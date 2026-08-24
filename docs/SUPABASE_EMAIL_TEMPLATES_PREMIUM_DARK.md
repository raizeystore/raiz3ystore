# RAIZEY STORE Premium Dark email templates

القوالب المعتمدة موجودة كملفات HTML منفصلة حتى تكون النسخة المستخدمة في Supabase واضحة وقابلة للمراجعة

| Supabase template | Subject | Source file |
| --- | --- | --- |
| Confirm sign up | رمز تأكيد حسابك في RAIZEY STORE | `supabase/templates/confirm-signup.html` |
| Reset password | رمز استعادة كلمة المرور في RAIZEY STORE | `supabase/templates/reset-password.html` |
| Change email address | رمز تأكيد تغيير البريد في RAIZEY STORE | `supabase/templates/change-email.html` |
| Reauthentication | رمز التحقق الأمني في RAIZEY STORE | `supabase/templates/reauthentication.html` |

## قواعد التنفيذ

- كل قالب يستخدم `{{ .Token }}` وحده ولا يستخدم روابط التأكيد
- Supabase يوثق `{{ .Token }}` في قوالب البريد كرمز OTP من 6 أرقام
- لا تضف أرقامًا ثابتة بجانب `{{ .Token }}` لأن ذلك يجعل الرمز الظاهر أطول من الرمز الحقيقي
- كل قالب يستخدم الشعار الرسمي من `{{ .SiteURL }}/brand/raizey-store-logo.png`
- التصميم داكن ومتوافق مع هوية الأسود والبرتقالي للموقع
- لا توجد شعارات مولدة أو أيقونات بديلة داخل القوالب
- النصوص المرئية لا تعتمد على علامات ترقيم في نهاية الجمل
- طول كل قالب أقل بكثير من حد Supabase البالغ 50000 حرف

## إعداد Supabase المطلوب

- Minimum interval per user = 60 seconds
- Confirm Email = enabled
- Secure Email Change = enabled
- Site URL = نطاق المتجر الفعلي

بعد تعديل أي قالب في المستودع انسخ محتواه نفسه إلى Authentication ثم Emails ثم Templates داخل Supabase Dashboard

إذا ظهر رمز مكون من أكثر من 6 أرقام بعد النسخ فتأكد أن مكان الرمز في القالب يحتوي `{{ .Token }}` فقط بدون أي أرقام مكتوبة قبله أو بعده
