# RAIZ3Y STORE

متجر إلكتروني لشحن الألعاب، مبني على أساس **security-first** مع Next.js وSupabase.

## Stack

- Next.js 16 + TypeScript
- Supabase Database / Auth / Storage
- Vercel
- GitHub + GitHub Actions
- Sentry — planned integration

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
- GitHub Actions CI: security contract tests + ESLint + TypeScript + production build.
- Committed `package-lock.json` لضمان builds قابلة لإعادة الإنتاج.

## Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` **server-only** ولا يجب وضعها في أي متغير يبدأ بـ `NEXT_PUBLIC_`.

## Quality checks

```bash
npm ci
npm run test:contracts
npm run lint
npm run typecheck
npm run build
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
- Sentry error monitoring.
- AI receipt analysis / customer-support AI بعد اكتمال واختبار الـcore التجاري.
- اختبارات E2E فعلية لدورة التسجيل → الطلب → الإيصال → المراجعة → التنفيذ.
