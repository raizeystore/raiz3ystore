# RAIZ3Y STORE

متجر إلكتروني لشحن الألعاب، مبني على أساس **security-first** مع Next.js وSupabase.

## Stack

- Next.js 16 + TypeScript
- Supabase Database / Auth / Storage
- Vercel
- GitHub + GitHub Actions
- Sentry monitoring
- Playwright E2E testing

## Implemented

- Supabase Auth: تسجيل، دخول، تأكيد البريد، استعادة كلمة المرور.
- Storefront: ألعاب، منتجات، صفحات عروض وCheckout.
- Secure checkout: السعر يُعاد قراءته من قاعدة البيانات ولا يملكه العميل.
- Idempotency + checkout rate limiting لمنع الطلبات المكررة والـspam.
- Orders: إنشاء الطلب، تفاصيل اللاعب، حالات الطلب وسجل الانتقالات.
- Manual payments: طرق دفع وإيصالات خاصة داخل Supabase Storage.
- Receipt validation: MIME allowlist + حد حجم 5MB + ownership checks.
- Admin: إدارة الألعاب، المنتجات، طرق الدفع، إعدادات التسعير، مراجعة الدفع، تنفيذ الطلبات.
- RLS + private helper functions + restricted privileged RPCs.
- Audit logs للعمليات الحساسة.
- CSP / security headers / no-store للصفحات الحساسة.
- Generated Supabase TypeScript database types.
- Sentry SDK wiring للمتصفح وNode.js وEdge؛ يظل معطلًا بأمان إلى أن تُضاف قيم DSN.
- Playwright E2E smoke suite للواجهة، صفحة الدخول، وحماية مسار الحساب.
- GitHub Actions CI: security contract tests + ESLint + TypeScript + production build + E2E.
- Committed `package-lock.json` لضمان builds قابلة لإعادة الإنتاج.

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` **server-only** ولا يجب وضعها في أي متغير يبدأ بـ `NEXT_PUBLIC_`.

## Optional Sentry environment variables

```env
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Monitoring stays disabled when the DSN is blank. `SENTRY_AUTH_TOKEN` is build/server-only and must never be exposed to the browser.

## Quality checks

```bash
npm ci
npm run test:contracts
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

نفس الفحوصات تعمل تلقائيًا على GitHub Actions عند كل Push أو Pull Request إلى `main`.

## Architecture and AI rules

- `AGENTS.md` — قواعد المشروع الأساسية لأي Coding Agent.
- `CLAUDE.md` — قواعد متوافقة مع الأدوات التي تقرأ ملف Claude instructions.
- `docs/ARCHITECTURE.md` — الحدود المعمارية ونموذج الأمان.
- `supabase/migrations/` — المصدر المعتمد لتاريخ تغييرات قاعدة البيانات والأمان.

## Remaining production work

- إنشاء أول حساب Admin موثوق ورفع دوره يدويًا بعد التحقق من ملكيته.
- إضافة بيانات المتجر الحقيقية: الألعاب، العروض، طرق الدفع والأسعار.
- إضافة DSN الحقيقي إلى Vercel لتفعيل إرسال أحداث Sentry الفعلية.
- AI receipt analysis / customer-support AI بعد اكتمال واختبار الـcore التجاري ببيانات فعلية.
- توسيع E2E إلى دورة شراء كاملة بعد وجود مستخدم Admin وبيانات دفع/منتجات حقيقية.
