# RAIZEY STORE — Auth Suite V3 Progress

> هذا هو ملف الحالة والتسليم الوحيد للمهمة. اقرأ `AGENTS.md` و`docs/AUTH_SUITE_V3_RUNBOOK.md` كاملين أولًا. حدّث هذا الملف بعد كل Phase وقبل التوقف أو تبديل الحساب أو انخفاض رصيد v0، ثم Commit وPush إلى Feature Branch فقط.

## قواعد التحديث

1. تحقّق من GitHub وVercel وSupabase والحالة المحلية قبل الوثوق بالقيم القديمة.
2. لا تحذف سجلًا صحيحًا؛ انقل الحالة بين `completed` و`in_progress` و`pending` مع تفاصيل دقيقة.
3. لا تكتب أن اختبارًا نجح ما لم تشغّله في الجلسة الحالية وتذكر Exit Code أو عدد النتائج.
4. لا تضع Secrets أو Environment Variable values أو Tokens أو Sessions في هذا الملف.
5. إذا تعارض هذا الملف مع GitHub، فالحالة الفعلية للفرع والـCommits هي المرجع، ثم صحّح الملف فورًا.
6. يجب أن تكون `next_exact_action` خطوة واحدة قابلة للتنفيذ مباشرة، لا وصفًا عامًا.

## الحالة الحالية

```yaml
schema_version: 1
last_updated_utc: "2026-09-03T07:53:00Z"
status: "READY_FOR_IMPLEMENTATION"
base_branch: "feat/storefront-final-shell"
base_commit: "24450cf67993bcd8f3d13625e9ed2dbd4f77bdac"
active_branch: "design/auth-suite-v3"
last_verified_code_commit: "24450cf67993bcd8f3d13625e9ed2dbd4f77bdac"
last_checkpoint_parent_commit: "f5ae3551c7a2f319f519c4402408a4d8398034b4"
documentation_setup_commits:
  - "1311aaa662aa418c2b5c1814b9e2e2ee05e396ad"
  - "439797d9ee5919a183f9c189c4cca980049b30de"
  - "f5ae3551c7a2f319f519c4402408a4d8398034b4"
production_branch: "main"
production_commit: "e9bc3289ee0d5b6b2acde42e65399a66f3d78ce1"
current_phase: "Phase 0 — baseline and repository verification"

v0_budget:
  scope: "Entire Auth Suite V3 task across every agent, account, and session"
  hard_cap_usd: 5.00
  reserve_for_handoff_usd: 0.50
  emergency_stop_remaining_usd: 0.10
  starting_balance_usd: "UNKNOWN"
  spent_usd: "UNKNOWN"
  remaining_usd: "UNKNOWN"
  mode: "NORMAL"
  last_checked_utc: null
  measurement_source: "v0 UI or explicit user report only"
  note: "Never infer or invent credit values when they are not visible"

completed:
  - "Verified GitHub branches, main, PR #13, and rejected design/auth-login-v2"
  - "Verified Vercel production is main at e9bc3289 and auth-login-v2 is preview only"
  - "Created design/auth-suite-v3 from storefront commit 24450cf6"
  - "Persisted the stable runbook and its mandatory pointer in AGENTS.md"
  - "Separated live progress from stable requirements and documented the shared USD 5 v0 cap"
in_progress: []
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
  - "AGENTS.md"
  - "docs/AUTH_SUITE_V3_RUNBOOK.md"
  - "docs/AUTH_SUITE_V3_PROGRESS.md"
tests:
  status: "NOT_RUN_DOCUMENTATION_ONLY"
  results: []
browser_checks: []
preview_url: "https://raiz3ystore-git-design-auth-suite-v3-raizeystore-5347s-projects.vercel.app"
known_failures: []
blockers: []
next_exact_action: "Read AGENTS.md, the full runbook, and this progress file; then re-verify the active branch, package.json, auth files, Vercel deployment, and Supabase project without changing production."
```

## حالة المراحل

- [ ] Phase 0: إعادة التحقق من Base، Feature Branch، GitHub، Vercel، Supabase، وملفات المشروع.
- [ ] Phase 1: فحص الشعار وإنتاج نسخة Versioned نظيفة والتحقق منها.
- [ ] Phase 2: إنتاج خلفية ألعاب أصلية للموبايل والكمبيوتر وفحصها وضغطها.
- [ ] Phase 3: بناء Design Tokens وAuthScene المشترك دون CSS متعارض.
- [ ] Phase 4: تنفيذ الصفحات الست مع الحفاظ على Auth flows.
- [ ] Phase 5: حالات UI وAccessibility وPerformance وSecurity review.
- [ ] Phase 6: تحديث الاختبارات وتشغيل جميع الفحوصات واختبار المتصفح.
- [ ] Phase 7: Design Review، إصلاح الملاحظات، إعادة الاختبارات، Commit، Draft PR، وVercel Preview.
- [ ] Phase 8: التوقف لانتظار موافقة المستخدم؛ ممنوع الدمج قبل **اعتمد وادمج**.

## سجل استهلاك v0

> أضف صفًا عند بداية ونهاية كل جلسة إذا كانت القيم ظاهرة. لا تخمّن. إن لم يظهر الرصيد فاكتب `UNKNOWN`.

| UTC | الوكيل/الحساب | الرصيد قبل | الرصيد بعد | المستهلك | الوضع | مصدر القياس | ملاحظة |
|---|---|---:|---:|---:|---|---|---|
| 2026-09-03 | إعداد نظام التسليم | UNKNOWN | UNKNOWN | UNKNOWN | NORMAL | غير متاح | لم تدّعِ الجلسة قراءة رصيد لا تعرضه الأداة |

## سجل Checkpoints

| UTC | Phase | Commit | ما تم | الاختبارات الفعلية | الخطوة التالية |
|---|---|---|---|---|---|
| 2026-09-03 | Setup | `2f83984bd6af5252f1b386c2c58a7993f1dfa7e5` | إنشاء الفرع والـRunbook وربط AGENTS | توثيق فقط؛ اختبارات الكود لم تُشغّل | إعادة التحقق ثم بدء Phase 1 |
| 2026-09-03 | Handoff | `f5ae3551c7a2f319f519c4402408a4d8398034b4` | فصل ملف المهمة عن التقدم وإضافة ميزانية v0 المشتركة | فحص توثيق وGitHub فقط؛ اختبارات الكود لم تُشغّل | تنفيذ `next_exact_action` |

## إجراء انخفاض الرصيد

### عند `$0.50` أو أقل — `CONSERVATION`

1. أوقف توليد الصور والبحث الواسع والـRefactor غير الضروري.
2. أكمل أصغر نقطة آمنة فقط.
3. شغّل الاختبارات المستهدفة السريعة المتاحة.
4. حدّث YAML وسجلي الاستهلاك والـCheckpoints.
5. راجع `git diff`، ثم Commit وPush.

### عند `$0.10` أو أقل — `EMERGENCY_HANDOFF`

1. لا تبدأ أي تعديل أو توليد أو بحث أو Deployment جديد.
2. سجّل بدقة: المكتمل، الجزئي، المتبقي، الملفات المتغيرة، آخر Commit، كل اختبار ونتيجته، الأعطال، الـPreview، والمخاطر.
3. اجعل `next_exact_action` أمرًا واحدًا محددًا للوكيل التالي.
4. Commit وPush لهذا الملف مع التغييرات الآمنة الموجودة.
5. توقف دون دمج `main` أو نشر Production.

## قالب تسليم سريع

استخدم هذا القالب داخل YAML بدل كتابة تقرير منفصل:

```yaml
status: "IN_PROGRESS | BLOCKED | READY_FOR_REVIEW | WAITING_FOR_APPROVAL"
current_phase: "Phase N — exact name"
completed:
  - "Concrete verified result"
in_progress:
  - "Partially completed item and exact state"
pending:
  - "Remaining item"
changed_files:
  - "path/to/file"
tests:
  status: "PASS | FAIL | PARTIAL | NOT_RUN"
  results:
    - command: "npm run typecheck"
      exit_code: 0
      summary: "0 TypeScript errors"
known_failures:
  - "Exact failure and evidence"
blockers:
  - "Exact blocker or empty"
next_exact_action: "One concrete action"
```

## رسالة الاستئناف الجاهزة

انسخ هذه الرسالة فقط للوكيل التالي؛ التفاصيل موجودة في المستودع ولا تُعد كتابتها داخل المحادثة:

```text
افتح المستودع raizeystore/raiz3ystore واعمل على الفرع design/auth-suite-v3 فقط. اقرأ AGENTS.md وdocs/AUTH_SUITE_V3_RUNBOOK.md كاملين، ثم اقرأ docs/AUTH_SUITE_V3_PROGRESS.md. تحقّق سريعًا أن حالة GitHub وVercel وSupabase توافق ملف التقدم، ثم نفّذ next_exact_action مباشرة دون إعادة البحث العام أو تغيير main/Production. التزم بميزانية v0 الكلية المشتركة البالغة 5 USD، وحدّث ملف التقدم وادفع Checkpoint قبل التوقف أو تبديل الحساب.
```
