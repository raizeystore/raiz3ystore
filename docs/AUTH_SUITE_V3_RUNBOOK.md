# RAIZEY STORE — Auth Suite V3 Runbook

> هذا الملف هو المرجع الثابت لمهمة إعادة تصميم صفحات الحساب. يجب على أي وكيل يعمل على المهمة قراءته كاملًا قبل التعديل، ثم تحديث قسم **حالة التسليم والاستئناف** قبل نهاية كل جلسة أو عند التوقف. لا تحذف المتطلبات الثابتة ولا تستبدلها بملخص.

## 1. طريقة استخدام هذا الملف

1. اقرأ `AGENTS.md` وهذا الملف كاملين.
2. تحقّق من الحالة الحقيقية في GitHub وVercel وSupabase قبل الاعتماد على حالة مكتوبة قديمة.
3. اعمل على Feature Branch فقط. لا تعدّل `main` ولا Production.
4. نفّذ المهمة من أول بند غير مكتمل في قسم **حالة التسليم والاستئناف**.
5. بعد كل مرحلة مكتملة: شغّل الاختبارات المرتبطة، حدّث حالة التسليم، ثم أنشئ Commit وPush.
6. إذا ظهر تحذير قرب انتهاء Credits/Tokens أو اضطررت للتوقف، أنشئ WIP checkpoint على الـFeature Branch بدل ترك العمل داخل مساحة الوكيل فقط.
7. عند الاستئناف في حساب أو وكيل جديد، لا تبدأ من الصفر: افحص آخر Commit و`git diff` وقارنها بحالة التسليم، ثم نفّذ **الخطوة التالية الدقيقة**.

## 2. بروتوكول منع ضياع العمل

عند اكتمال مرحلة أو قرب توقف الجلسة:

1. شغّل `git status --short --branch` وراجع `git diff --stat` و`git diff`.
2. لا تضف Secrets أو ملفات Environment أو ملفات مؤقتة.
3. شغّل أسرع الاختبارات المرتبطة بالتغييرات الحالية.
4. حدّث قسم **حالة التسليم والاستئناف** في هذا الملف، بما يشمل الاختبارات الفاشلة وأسبابها دون إخفائها.
5. أنشئ Commit واضحًا وPush إلى Feature Branch.
6. إذا كانت المرحلة غير مكتملة، استخدم رسالة مثل:

   ```text
   wip(auth): checkpoint <short phase name>
   ```

7. لا تنشئ WIP Commit على `main`، ولا تفتح Auto-merge.

## 3. حالة GitHub وVercel المؤكدة عند إنشاء الملف

آخر تحقق: `2026-09-02 UTC`

- المستودع: `raizeystore/raiz3ystore`
- Production Branch في Vercel: `main`
- Production Commit المنشور: `e9bc3289ee0d5b6b2acde42e65399a66f3d78ce1`
- Production Deployment: `READY`
- أحدث Storefront Preview Branch: `feat/storefront-final-shell`
- Storefront Preview Commit: `24450cf67993bcd8f3d13625e9ed2dbd4f77bdac`
- Draft PR للـStorefront: `#13`
- فرع Auth المرفوض بصريًا: `design/auth-login-v2`
- آخر Commit في فرع Auth المرفوض: `6ca27fb3423a2613c6e62db9bfb8b9db5da26605`
- آخر Auth Preview: `READY` لكنه Preview وليس Production.
- قاعدة Auth Suite V3 المختارة: `24450cf67993bcd8f3d13625e9ed2dbd4f77bdac`، لأنها تحتوي أحدث Storefront shell دون Commitي تصميم Login V2 المرفوضين.
- فرع التنفيذ: `design/auth-suite-v3`
- مشروع Supabase: `raizeystore`
- Supabase Project Ref: `iqzjfliuforrrtnyumqr`

هذه البيانات Snapshot وليست بديلًا عن التحقق الحي عند الاستئناف.

## 4. حالة التسليم والاستئناف

> هذا هو القسم التشغيلي الوحيد الذي يجب تحديثه باستمرار. لا تحذف الحقول؛ استبدل قيمها وأضف التفاصيل اللازمة.

```yaml
last_updated_utc: "2026-09-02T00:00:00Z"
status: "RUNBOOK_CREATED"
base_branch: "feat/storefront-final-shell"
base_commit: "24450cf67993bcd8f3d13625e9ed2dbd4f77bdac"
active_branch: "design/auth-suite-v3"
head_commit: "TO_BE_UPDATED_AFTER_RUNBOOK_COMMIT"
production_branch: "main"
production_commit: "e9bc3289ee0d5b6b2acde42e65399a66f3d78ce1"
current_phase: "Phase 0 — baseline and repository verification"
completed:
  - "Verified GitHub branches, main, PR #13, and rejected design/auth-login-v2"
  - "Verified Vercel production is main at e9bc3289 and auth-login-v2 is preview only"
in_progress:
  - "Create and persist this runbook on design/auth-suite-v3"
pending:
  - "Re-verify repository and environment from the implementation agent"
  - "Brand and logo repair"
  - "Original responsive gaming background"
  - "Shared AuthScene and semantic CSS tokens"
  - "Implement all six Auth pages"
  - "Accessibility, performance, and security review"
  - "Automated and browser verification"
  - "Draft PR and Vercel Preview for user approval"
changed_files:
  - "docs/AUTH_SUITE_V3_RUNBOOK.md"
tests:
  status: "NOT_RUN_DOCUMENTATION_ONLY"
  results: []
preview_url: null
known_failures: []
blockers: []
next_exact_action: "Read AGENTS.md and this runbook, then re-verify branch, package.json, auth files, Vercel, and Supabase without changing production."
```

## 5. المهمة والحدود

أنت الوكيل التقني المسؤول عن إعادة تصميم وتنفيذ نظام صفحات الحساب في مشروع RAIZEY STORE.

الهدف هو إنشاء تصميم Production-ready موحّد وفخم للصفحات التالية:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-code`
- `/complete-profile`

نفّذ العمل على Feature Branch مستقل، وارفع Vercel Preview للمعاينة. يُمنع دمج التغييرات في `main` أو نشرها إلى Production قبل موافقة المستخدم الصريحة بعبارة: **اعتمد وادمج**.

لا تنتقل إلى تصميم الصفحة الرئيسية أو لوحة الإدارة ضمن هذه المهمة.

## 6. المستودع والـStack المؤكد

المستودع الرسمي:

```text
https://github.com/raizeystore/raiz3ystore.git
```

التقنيات الحالية:

- Next.js 16 App Router
- React 19
- TypeScript
- npm و`package-lock.json`
- Supabase Database/Auth
- Vercel
- CSS عادي
- RTL عربي
- Cairo وAlexandria عبر `next/font/google`
- `lucide-react`
- Sentry

Scripts المتاحة:

```json
{
  "build": "next build",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test:contracts": "node --test tests/*.test.mjs",
  "test:e2e": "playwright test"
}
```

ممنوع إضافة Tailwind أو shadcn/ui أو استبدال نظام CSS أو مكتبة المكونات الحالية. لا تضف Dependency جديدة دون ضرورة مثبتة وفحص توافقها وأمانها.

## 7. فحص البداية واختيار الفرع

قبل تعديل الكود:

1. افحص GitHub والفروع والـPRs وآخر Commits.
2. افحص Vercel وحدد Production Branch والـCommit المنشور فعليًا.
3. قارن بين:

   ```text
   origin/main
   origin/feat/storefront-final-shell
   origin/design/auth-login-v2
   origin/design/auth-suite-v3
   ```

4. تحقّق أن `design/auth-suite-v3` مبني من `24450cf67993bcd8f3d13625e9ed2dbd4f77bdac` أو سجّل أي اختلاف قبل المتابعة.
5. لا تدمج `design/auth-login-v2`؛ تصميمه مرفوض بصريًا ويُستخدم للمقارنة فقط.
6. لا تفترض أن `main` يحتوي أحدث Storefront UI.
7. لا تحذف أو تستبدل أي تغييرات غير محفوظة. إذا وجدت تغييرات محلية، سجّلها واحفظها في checkpoint قبل العمل.
8. إذا تعذر استخدام اسم الفرع المحدد، أنشئ اسمًا Versioned ولا تكتب فوق فرع سابق.

## 8. الملفات والمكونات التي يجب فحصها أولًا

لا تعِد بناء وظائف موجودة قبل قراءة الملفات المرتبطة:

```text
app/login/page.tsx
app/register/page.tsx
app/forgot-password/page.tsx
app/reset-password/page.tsx
app/verify-code/page.tsx
app/complete-profile/page.tsx
app/auth/actions.ts
app/auth-ui.css
app/globals.css
app/layout.tsx

src/components/auth/auth-scene.tsx
src/components/auth/login-form.tsx
src/components/auth/register-form.tsx
src/components/auth/reset-password-form.tsx
src/components/auth/country-phone-input.tsx
src/components/auth/resend-code-button.tsx
src/components/auth/auth-icons.tsx
src/components/auth/google-icon.tsx
src/components/brand-logo.tsx

public/brand/raizey-store-logo-original.png
public/brand/raizey-store-logo.png
public/brand/raizey-store-mark.png
public/auth-gaming-bg.webp
```

إذا كان `raizey-store-logo-original.png` غير موجود في قاعدة الفرع، سجّل ذلك ولا تخترع ملفًا بديلًا باسم مماثل.

`public/auth-gaming-bg.webp` أصل غير صالح للاستخدام الموثوق. لا تستخدمه ولا تكتفِ بتغيير امتداده. استبدله بأصل جديد صالح بعد فحصه وتحسينه.

استخدم `rg` و`rg --files` للوصول إلى الملفات والرموز المرتبطة، ولا تقرأ المستودع كله دون سبب.

## 9. وظائف Auth الحالية التي يجب الحفاظ عليها

يحتوي المشروع بالفعل على:

- `signInWithPassword`
- `signUp`
- Google OAuth عبر `signInWithOAuth`
- `resetPasswordForEmail`
- التحقق برمز OTP من 6 أرقام عبر `verifyOtp`
- إعادة تعيين كلمة المرور عبر `updateUser`
- استكمال الاسم ورقم WhatsApp والموافقات
- التحقق من `profiles.is_active`
- Safe redirect باستخدام `next`
- Cookies مؤمنة لحالة التحقق
- مهلة 60 ثانية لإعادة إرسال OTP
- رسائل الخطأ والنجاح
- سياسة كلمة مرور لا تقل عن 10 أحرف
- التحقق من أرقام الهاتف باستخدام `libphonenumber-js`

لا تغيّر التدفقات أو أسماء الحقول أو Server Actions إلا إذا أثبت اختبار أو تشخيص واضح وجود مشكلة فعلية.

تحقق من Supabase schema وEnvironment Variables المستخدمة، لكن لا تنشئ Migration ولا تغيّر RLS أو Auth Providers أو Google OAuth دون ضرورة مثبتة. لا تستخدم `service_role` في Frontend ولا تعرض أي Secret أو Token أو Session في الكود أو Logs أو التقرير.

## 10. المهارات المطلوبة ومسار استخدامها

اكتشف المهارات المثبتة، ثم استخدم أقل مجموعة تغطي الجزء الجاري. اقرأ `SKILL.md` كاملًا لكل مهارة مختارة قبل تنفيذ الجزء المرتبط بها.

الترتيب المنطقي:

1. `brand` للهوية وقواعد الشعار.
2. `ui-ux-pro-max` لنظام التصميم، Typography، Responsive، وحالات المكونات.
3. `banner-design` لتكوين خلفية Auth.
4. `image-processing` لفحص وإصلاح الشعار والأصول والشفافية والتحويل والضغط.
5. `imagegen` لخلفية الألعاب فقط إذا كانت أداة Image Generation الفعلية متاحة.
6. `nextjs` للبنية الصحيحة مع App Router وReact 19.
7. `supabase` لمراجعة تكامل Auth الحالي دون تغييرات غير مطلوبة.
8. `accessibility` لتدقيق WCAG 2.2 AA والنماذج ولوحة المفاتيح.
9. `performance` لفحص LCP وCLS وحجم الصور والخطوط والحركة.
10. `webapp-testing` لاختبار الصفحات والتدفقات في المتصفح.
11. `design-review` للمراجعة البصرية بعد التنفيذ.
12. `verification-before-completion` قبل إعلان الاكتمال.

استخدم `systematic-debugging` فقط عند وجود Error أو Test Failure، وليس كخطوة شكلية. استخدم React Composition Patterns فقط إذا احتاجت مكونات Auth إلى Refactor حقيقي.

لا تثبت مكتبة أيقونات أخرى. استخدم `lucide-react` والمكونات الموجودة لعناصر UI العادية.

## 11. الهوية البصرية المطلوبة

التصميم المطلوب:

- فخم ومخصص لمتجر شحن ألعاب، وليس قالب SaaS عام.
- Mobile-first مع تصميم Desktop حقيقي، وليس بطاقة هاتف مكبرة.
- عنصر بصري مميز واحد بدل ازدحام المؤثرات.
- بطاقة Auth كريمية واضحة فوق خلفية ألعاب داكنة وهادئة.
- لا تستخدم ألوانًا بنفسجية أو زرقاء غريبة عن الهوية.
- لا تستخدم عنوانًا ضخمًا يستهلك نصف الشاشة.
- لا تستخدم Emojis كأيقونات.
- لا تسمح بتداخل النصوص أو قصها أو تقسيم العناوين بصورة سيئة.
- الحركات معتدلة وسريعة ولا تؤثر في القراءة أو الأداء.

عرّف لوحة الألوان عبر CSS Variables دلالية مشتركة:

```css
--auth-night-soft: #17100c;
--auth-cream: #fff8f0;
--auth-cream-soft: #f8ebdd;
--auth-orange: #ff6500;
--auth-orange-deep: #a94000;
--auth-ink: #211a16;
--auth-muted: #70645c;
--auth-border: #e8d6c6;
```

يمكن إضافة درجات متناسقة عند الحاجة، لكن يجب أن تبقى دلالية ومحدودة.

- الكريمي للبطاقة والحقول.
- البرتقالي للـPrimary CTA وحالات التركيز والعناصر المهمة فقط.
- لا تنشر البرتقالي في كل العناصر.
- تباين النصوص يجب أن يطابق WCAG AA على الأقل.
- اهتم بـ`line-height` و`text-wrap` والتشكيل العربي والتدرج الطباعي الواضح.
- دقّق النصوص والإملاء وعلامات الترقيم قبل اعتمادها.

## 12. إصلاح الشعار

الشعار الحالي يعاني من Matte داكن شبه شفاف حول الحواف، لذلك قد تظهر خلفه خلفية مستطيلة.

المطلوب:

1. افحص أصول الشعار الموجودة فعليًا.
2. لا تخترع شعارًا جديدًا.
3. لا تستبدل الشعار بحرف `R` من CSS أو Lucide.
4. حافظ على هندسة الشعار وألوانه وترتيبه واتجاهه.
5. نظّف Alpha residue بصورة غير تخريبية.
6. أنشئ ملفًا جديدًا Versioned بدل الكتابة فوق الأصل مباشرة.
7. فضّل إعادة رسم دقيقة بصيغة SVG فقط إذا أمكن الحفاظ على الشكل 100%.
8. وفّر PNG شفافًا حقيقيًا كـFallback.
9. تحقق أن Corner Alpha يساوي صفرًا وأنه لا توجد هالة سوداء أو بيضاء.
10. اعرض الشعار مباشرة فوق الخلفية دون Plate أو Shadow أو Border.

لا تستبدل أصل Production قبل فحص النسخة الجديدة بصريًا على خلفية فاتحة وداكنة. سجّل اسم الملف، أبعاده، حجمه، وصيغة الألوان والشفافية في حالة التسليم.

## 13. خلفية الألعاب

أنشئ خلفية أصلية وهادئة تناسب صفحات Auth:

- أجواء Battle Royale وشحن ألعاب.
- شخصيات ألعاب أصلية وغير منسوخة.
- عناصر خفيفة مثل Controller وCoins وDiamonds وبطاقات رقمية.
- تركيز برتقالي دافئ.
- مساحات هادئة خلف النص والنموذج.
- الشخصيات والعناصر على الأطراف وأسفل التكوين.
- لا تضع داخل الصورة كلمات أو شعارات أو Watermarks.
- لا تعتمد على كتابة يولدها نموذج الصور.
- أسماء `PUBG UC` و`FREE FIRE`، إن استُخدمت، تكون HTML دقيقة خارج الصورة.

أنشئ Crops مستقلة ومدروسة للموبايل والكمبيوتر، ثم:

- افحص فك الترميز.
- افحص الأبعاد والنسبة والحجم.
- حسّنها إلى WebP أو AVIF صالح.
- عرّف `background-position` مناسبًا لكل Breakpoint.
- استخدم Scrim أو Gradient لضمان وضوح النص.
- لا تجعل الصورة تؤثر سلبًا في LCP أو تسبب CLS.
- لا تدّعِ إنشاء صورة فوتوغرافية إذا لم تكن أداة Image Generation متاحة؛ استخدم أصلًا مأذونًا أو تصميم CSS/Canvas أصليًا.

## 14. البنية المشتركة للصفحات

استخدم `AuthScene` أو Refactor منظمًا له لإنشاء Auth Shell مشترك دون تكرار أو nested cards.

تكوين الصفحة:

1. الشعار الشفاف في الأعلى.
2. Eyebrow صغير.
3. عنوان مختصر وواضح.
4. وصف من سطر أو سطرين.
5. شارات صغيرة، مثل:
   - شحن سريع
   - تتبع لحظي
   - دفع آمن
6. بطاقة كريمية واحدة للنموذج.
7. عنوان النموذج ووصف مختصر.
8. حقول واضحة مع Labels دائمة.
9. زر Primary برتقالي واحد.
10. Google كزر Secondary.
11. روابط التنقل بين صفحات Auth.
12. ملاحظة أمان صغيرة في الأسفل.

لا تجعل الشارات تزاحم النموذج على الموبايل. يمكن تقليلها أو إعادة ترتيبها مع الحفاظ على المعنى.

## 15. النصوص المعتمدة مبدئيًا

راجع النصوص الموجودة وحافظ على رسائل الخطأ الدقيقة. لا تستبدل الرسائل المفيدة برسائل عامة.

### Login

- عنوان المشهد: **ألعابك أقرب مما تتخيّل**
- عنوان البطاقة: **مرحبًا بعودتك**
- الوصف: **أدخل بياناتك للمتابعة إلى حسابك.**
- الزر: **تسجيل الدخول**
- Google: **المتابعة عبر Google**
- الرابط: **ليس لديك حساب؟ إنشاء حساب جديد**

### Register

- عنوان المشهد: **حساب واحد لكل ألعابك**
- عنوان البطاقة: **إنشاء حساب جديد**
- الوصف: **أنشئ حسابك وتابع طلباتك وعروضك من مكان واحد.**
- الزر: **إنشاء الحساب**
- Google: **التسجيل عبر Google**
- الرابط: **لديك حساب بالفعل؟ تسجيل الدخول**

قسّم الحقول بصريًا إلى **بيانات الحساب** و**حماية الحساب**. لا تحوّل التسجيل إلى Multi-step إلا إذا كان ذلك ضروريًا ومبررًا، وحافظ على السلوك الحالي.

### Forgot Password

- عنوان المشهد: **سنساعدك على العودة**
- عنوان البطاقة: **نسيت كلمة المرور؟**
- الوصف: **أدخل بريدك وسنرسل إليك رمزًا آمنًا للاستعادة.**
- الزر: **إرسال رمز الاستعادة**
- الرابط: **العودة إلى تسجيل الدخول**

### Reset Password

- عنوان المشهد: **حماية جديدة لحسابك**
- عنوان البطاقة: **تعيين كلمة مرور جديدة**
- الوصف: **اختر كلمة مرور قوية ومختلفة لحماية حسابك.**
- الزر: **تحديث كلمة المرور**

### Verify Code

- عنوان المشهد: **أكد بريدك بأمان**
- عنوان البطاقة: **أدخل رمز التحقق**
- الوصف: **أدخل الرمز المكوّن من 6 أرقام.**
- الزر: **تأكيد الرمز**

### Complete Profile

- عنوان المشهد: **خطوة أخيرة وتبدأ**
- عنوان البطاقة: **إكمال بيانات الحساب**
- الوصف: **أضف بياناتك الأساسية لمتابعة الطلبات بصورة صحيحة.**
- الزر: **حفظ ومتابعة**

## 16. الأيقونات

استخدم الأيقونات الموجودة أو نظائرها من `lucide-react`:

- `Mail`
- `Lock`
- `Eye`
- `EyeOff`
- `User`
- `Phone`
- `ShieldCheck`
- `KeyRound`
- سهم تنقل مناسب لاتجاه RTL

حافظ على Stroke وأحجام ومحاذاة موحدة. استخدم `aria-hidden` للأيقونات الزخرفية و`aria-label` للأزرار التي تحتوي أيقونة فقط. مساحة الضغط لا تقل عن `44×44px`.

## 17. حالات الواجهة المطلوبة

صمّم واختبر:

- Default
- Hover
- Focus visible
- Filled
- Error
- Success
- Disabled
- Loading
- Password visible/hidden
- Google OAuth loading
- OTP resend countdown
- Long Arabic error message
- Mobile keyboard open
- Autofill

لا تمنع نسخ أو لصق كلمات المرور، واستخدم قيم `autocomplete` الصحيحة.

## 18. Responsive والأجهزة المستهدفة

اختبر فعليًا على:

- `375px`
- `393px`
- `768px`
- `1024px`
- `1440px`

اهتم خصوصًا بشاشة Honor X9c، وتحقق من:

- عدم وجود Horizontal Scroll.
- عدم اختفاء الأزرار خلف لوحة المفاتيح.
- احترام Safe Areas.
- عدم تداخل النصوص.
- عدم تمدد البطاقة بصورة مبالغ فيها.
- وضوح Portrait وLandscape.
- ألا يتحول Desktop إلى Mobile Card مكبرة.

## 19. Accessibility

طبّق:

- Labels مرتبطة بالحقول.
- رسائل أخطاء مرتبطة بـ`aria-describedby`.
- `role="alert"` للأخطاء.
- `role="status"` للحالات الناجحة والتحميل.
- Focus واضح.
- ترتيب Keyboard منطقي.
- دعم `prefers-reduced-motion`.
- تباين WCAG 2.2 AA.
- عدم الاعتماد على اللون وحده.
- عدم كسر Zoom.
- دعم Password Managers وAutofill.
- الحفاظ على `autocomplete="one-time-code"` للـOTP.

## 20. الأمان

لا تغيّر Auth Logic بلا ضرورة.

إذا اضطررت لتعديل `app/auth/actions.ts`:

- راجع Open Redirect.
- راجع Broken Authentication.
- راجع Cookie attributes.
- راجع Rate Limiting.
- راجع Account Enumeration.
- راجع إدخال الهاتف والبريد.
- لا تعرض تفاصيل Supabase الداخلية للمستخدم.
- لا تعرض Tokens أو Sessions في Logs.
- لا تضف Secret إلى Client Bundle.

لا تنشئ Migration ولا تعدّل بيانات Production.

## 21. تقليل استهلاك Tokens/Credits

- لا تعِد شرح معلومات هذا الملف.
- لا تبدأ بحثًا عامًا عن Framework أو مكتبة.
- لا تقرأ كل المستودع دون سبب.
- استخدم `rg` للوصول إلى الملفات المرتبطة.
- لا تبحث في الويب إلا عند API حديث غير واضح أو Blocker فعلي.
- لا تقترح مكتبات جديدة.
- لا ترسل تقارير طويلة أثناء التنفيذ.
- أعطِ خطة قصيرة جدًا ثم ابدأ العمل مباشرة.
- نفّذ أوامر الفحص المستقلة بالتوازي عندما يكون ذلك آمنًا.
- لا تسأل سؤالًا يمكن حله بفحص GitHub أو Vercel أو Supabase.
- ادفع Checkpoint بعد كل مرحلة حتى لا تضيع تغييرات عند انتهاء Credits.

## 22. مراحل التنفيذ القابلة للتتبع

حدّث هذه القائمة وحالة التسليم بعد كل مرحلة:

- [ ] Phase 0: إعادة التحقق من Base، Feature Branch، GitHub، Vercel، Supabase، وملفات المشروع.
- [ ] Phase 1: فحص الشعار وإنتاج نسخة Versioned نظيفة والتحقق منها.
- [ ] Phase 2: إنتاج خلفية ألعاب أصلية للموبايل والكمبيوتر وفحصها وضغطها.
- [ ] Phase 3: بناء Design Tokens وAuthScene المشترك دون CSS متعارض.
- [ ] Phase 4: تنفيذ الصفحات الست مع الحفاظ على Auth flows.
- [ ] Phase 5: حالات UI وAccessibility وPerformance وSecurity review.
- [ ] Phase 6: تحديث الاختبارات وتشغيل جميع الفحوصات واختبار المتصفح.
- [ ] Phase 7: Design Review، إصلاح الملاحظات، إعادة الاختبارات، Commit، Draft PR، وVercel Preview.
- [ ] Phase 8: التوقف لانتظار موافقة المستخدم؛ ممنوع الدمج قبل **اعتمد وادمج**.

## 23. الاختبارات الإلزامية

بعد التنفيذ شغّل واقرأ النتائج كاملة:

```bash
npm run lint
npm run typecheck
npm run test:contracts
npm run build
npm run test:e2e
```

إذا تعذر اختبار بسبب Environment Variable أو خدمة خارجية، سجّل الاختبار والسبب بدقة. لا تدّعِ نجاحه.

اختبر في المتصفح:

- فتح جميع صفحات Auth.
- ظهور الشعار دون خلفية أو Alpha halo.
- فك ترميز صورة الخلفية دون أخطاء.
- Login validation.
- Register validation.
- إظهار وإخفاء كلمة المرور.
- Forgot Password.
- OTP code UI والـresend countdown.
- Reset Password session guard.
- Complete Profile guard.
- Google OAuth redirect دون إكمال تسجيل حقيقي إذا لم يتوفر Test Account.
- Console دون أخطاء.
- Network دون `404` أو صور تالفة.
- Mobile وTablet وDesktop.

لا تنفّذ طلبات حقيقية تغيّر بيانات Production من أجل اختبار بصري.

## 24. مراجعة التصميم والتحقق النهائي

بعد التنفيذ:

1. التقط Screenshots لكل صفحة على Mobile وDesktop.
2. نفّذ Design Review.
3. أصلح المسافات والمحاذاة والتباين والتداخل والنصوص.
4. أعد الاختبارات المتأثرة.
5. طبّق Verification Before Completion.
6. لا تعتبر العمل مكتملًا قبل وجود أدلة حديثة من الاختبارات والمعاينة.

## 25. Git وVercel

بعد نجاح الاختبارات:

1. راجع `git diff` و`git status`.
2. تأكد من عدم وجود ملفات مؤقتة أو Secrets.
3. أنشئ Commit واضحًا مثل:

   ```text
   feat(auth): redesign complete authentication experience
   ```

4. Push للـFeature Branch فقط.
5. أنشئ Draft PR إن كانت الصلاحيات متاحة.
6. أنشئ Vercel Preview Deployment للفرع.
7. لا تغيّر Production Branch.
8. لا تدمج في `main`.
9. لا تنشر إلى Production.

## 26. التقرير النهائي

أرسل تقريرًا مختصرًا يحتوي فقط على:

- Base Branch والـCommit الذي بدأت منه.
- اسم Feature Branch.
- الملفات التي تغيرت.
- رابط Vercel Preview.
- Screenshots أو روابط Mobile وDesktop.
- نتيجة كل اختبار مع Exit Code أو أرقام واضحة.
- ما تم التحقق منه في Supabase.
- حالة الشعار والخلفية وأبعادهما وأحجامهما.
- أي شيء لم يتم التحقق منه.
- المخاطر المتبقية.
- المهارات المستخدمة فعليًا.
- آخر Commit مدفوع والخطوة التالية إن لم تكتمل المهمة.

بعد رفع المعاينة، توقّف وانتظر موافقة المستخدم. لا تدمج أي شيء في `main` حتى يقول المستخدم صراحة: **اعتمد وادمج**.
