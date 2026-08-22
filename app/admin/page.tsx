import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createGame, createPaymentMethod, createProduct, reviewPayment, updateStoreSettings } from "@/app/admin/actions";

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

function messageText(message?: string) {
  const map: Record<string, string> = {
    game_created: "تمت إضافة اللعبة بنجاح.",
    product_created: "تمت إضافة المنتج بنجاح.",
    payment_method_created: "تمت إضافة طريقة الدفع وتفعيلها.",
    settings_updated: "تم تحديث إعدادات التسعير.",
    payment_confirmed: "تم تأكيد الدفع وتحديث الطلب.",
    payment_rejected: "تم رفض الدفع ويمكن للعميل رفع إيصال جديد.",
  };
  return message ? map[message] : undefined;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const query = await searchParams;
  const { profile } = await requireAdmin();
  const admin = createAdminClient();

  const [usersRes, gamesRes, productsRes, ordersRes, paymentsRes, gamesListRes, settingsRes, reviewRes, methodsRes] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("games").select("*", { count: "exact", head: true }),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("payments").select("*", { count: "exact", head: true }),
    admin.from("games").select("id, name, slug, status").order("sort_order", { ascending: true }).order("name"),
    admin.from("store_settings").select("usd_to_sdg_rate, default_profit_margin, currency").eq("id", 1).maybeSingle(),
    admin.from("payments").select("id, order_id, amount, currency, status, created_at").eq("status", "under_review").order("created_at", { ascending: true }).limit(20),
    admin.from("payment_methods").select("id, name, code, account_label, account_identifier, status").order("sort_order", { ascending: true }),
  ]);

  const reviewPayments = reviewRes.data ?? [];
  const orderIds = [...new Set(reviewPayments.map((payment) => payment.order_id))];
  const paymentIds = reviewPayments.map((payment) => payment.id);
  const [reviewOrdersRes, receiptsRes] = await Promise.all([
    orderIds.length ? admin.from("orders").select("id, order_number, user_id, status").in("id", orderIds) : Promise.resolve({ data: [] }),
    paymentIds.length ? admin.from("payment_receipts").select("id, payment_id, original_filename, mime_type, status, created_at").in("payment_id", paymentIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ]);

  const reviewOrders = reviewOrdersRes.data ?? [];
  const receipts = receiptsRes.data ?? [];
  const settings = settingsRes.data;
  const success = messageText(query.message);
  const stats = [
    { label: "المستخدمون", value: usersRes.count ?? 0 },
    { label: "الألعاب", value: gamesRes.count ?? 0 },
    { label: "المنتجات", value: productsRes.count ?? 0 },
    { label: "الطلبات", value: ordersRes.count ?? 0 },
    { label: "المدفوعات", value: paymentsRes.count ?? 0 },
  ];

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="تنقل الإدارة">
            <Link href="/admin">نظرة عامة</Link><Link href="/orders">الطلبات</Link><Link href="/games">واجهة المتجر</Link><Link href="/account">حسابي</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" />ADMIN CONTROL</span><h1>لوحة إدارة RAIZEY</h1><p>{profile.display_name ? `مرحبًا ${profile.display_name}. ` : ""}كل عمليات الكتابة تمر عبر Server Actions بعد التحقق من صلاحية الإدارة.</p></div></div>
          {success && <div className="notice" role="status">{success}</div>}
          {query.error && <div className="notice notice-error" role="alert">تعذر تنفيذ العملية الإدارية. تحقق من البيانات وحاول مرة أخرى.</div>}
          <div className="games-grid">
            {stats.map((stat) => <article className="game-card" data-short="R" key={stat.label}><span>RAIZEY METRIC</span><h3>{stat.value.toLocaleString("ar")}</h3><p>{stat.label}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">PAYMENT REVIEW</span><h2>إيصالات تنتظر القرار</h2></div><p>القبول أو الرفض يحدث داخل معاملة قاعدة بيانات واحدة ويحدّث الدفع والطلب والإيصال وسجل التدقيق معًا.</p></div>
          {!reviewPayments.length ? <div className="cta-band"><div><h2>ما في دفعات قيد المراجعة</h2><p>أي إيصال جديد سيظهر هنا تلقائيًا.</p></div></div> : (
            <div style={{ display: "grid", gap: 16 }}>
              {reviewPayments.map((payment) => {
                const order = reviewOrders.find((item) => item.id === payment.order_id);
                const receipt = receipts.find((item) => item.payment_id === payment.id);
                return <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={payment.id}>
                  <div className="auth-card-header"><span className="card-kicker">{order?.order_number ?? "ORDER"}</span><h2>{new Intl.NumberFormat("ar-SD").format(payment.amount)} {payment.currency}</h2><p>الإيصال: {receipt?.original_filename ?? "—"} • {receipt?.status ?? "pending"}</p></div>
                  <form className="auth-form" action={reviewPayment}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <label className="field"><span className="field-label">ملاحظة المراجعة</span><textarea name="reason" maxLength={500} rows={3} style={controlStyle} placeholder="سبب الرفض أو ملاحظة داخلية اختيارية" /></label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}><button className="btn btn-primary" type="submit" name="decision" value="confirm">تأكيد الدفع</button><button className="btn btn-secondary" type="submit" name="decision" value="reject">رفض الإيصال</button>{order?.order_number && <Link className="btn btn-secondary" href={`/orders/${order.order_number}`}>فتح الطلب</Link>}</div>
                  </form>
                </article>;
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">CATALOG & PAYMENT</span><h2>إدارة المتجر</h2></div><p>الألعاب والمنتجات وطرق الدفع تُكتب من السيرفر فقط، ولا توجد صلاحية كتابة مباشرة للمتصفح.</p></div>
          <div className="info-grid">
            <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
              <div className="auth-card-header"><h2>إضافة لعبة</h2><p>Slug إنجليزي صغير مثل pubg-mobile.</p></div>
              <form className="auth-form" action={createGame}><label className="field"><span className="field-label">اسم اللعبة</span><input name="name" required maxLength={120} /></label><label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label><label className="field"><span className="field-label">الوصف</span><textarea name="description" rows={4} maxLength={1000} style={controlStyle} /></label><button className="btn btn-primary" type="submit">إضافة اللعبة</button></form>
            </article>

            <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
              <div className="auth-card-header"><h2>إضافة منتج</h2><p>العرض والسعر الحالي المرتبط باللعبة.</p></div>
              <form className="auth-form" action={createProduct}>
                <label className="field"><span className="field-label">اللعبة</span><select name="gameId" required defaultValue="" style={controlStyle}><option value="" disabled>اختر اللعبة</option>{(gamesListRes.data ?? []).map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
                <label className="field"><span className="field-label">اسم العرض</span><input name="name" required maxLength={120} /></label><label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label><label className="field"><span className="field-label">SKU اختياري</span><input name="sku" maxLength={80} dir="ltr" /></label>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}><label className="field"><span className="field-label">السعر</span><input name="price" type="number" min="0" step="0.01" required inputMode="decimal" /></label><label className="field"><span className="field-label">العملة</span><input name="currency" defaultValue="SDG" maxLength={5} required dir="ltr" /></label></div>
                <label className="field"><span className="field-label">الوصف</span><textarea name="description" rows={4} maxLength={1000} style={controlStyle} /></label><button className="btn btn-primary" type="submit">إضافة المنتج</button>
              </form>
            </article>

            <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
              <div className="auth-card-header"><h2>إضافة طريقة دفع</h2><p>مثلاً تحويل بنكي أو محفظة. بيانات الحساب لا تظهر للزائر غير المسجل.</p></div>
              <form className="auth-form" action={createPaymentMethod}>
                <label className="field"><span className="field-label">اسم الطريقة</span><input name="paymentName" required maxLength={100} placeholder="بنكك / محفظة / تحويل" /></label>
                <label className="field"><span className="field-label">Code</span><input name="paymentCode" required maxLength={40} pattern="[A-Za-z0-9_-]{2,40}" dir="ltr" placeholder="BANKAK" /></label>
                <label className="field"><span className="field-label">اسم الحساب أو الوصف</span><input name="accountLabel" maxLength={120} placeholder="اسم صاحب الحساب" /></label>
                <label className="field"><span className="field-label">رقم الحساب / المعرف</span><input name="accountIdentifier" required maxLength={180} dir="ltr" /></label>
                <label className="field"><span className="field-label">تعليمات الدفع</span><textarea name="paymentInstructions" rows={4} maxLength={1000} style={controlStyle} placeholder="حوّل المبلغ كاملًا ثم ارفع الإيصال" /></label>
                <button className="btn btn-primary" type="submit">إضافة وتفعيل طريقة الدفع</button>
              </form>
              {!!methodsRes.data?.length && <div className="trust-row" style={{ marginTop: 20 }}>{methodsRes.data.map((method) => <span className="trust-chip" key={method.id}>{method.name} • {method.status}</span>)}</div>}
            </article>

            <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
              <div className="auth-card-header"><h2>التسعير العام</h2><p>إعدادات سعر الدولار ونسبة الربح ستكون أساس محرك التسعير التلقائي.</p></div>
              <form className="auth-form" action={updateStoreSettings}><label className="field"><span className="field-label">1 USD = كم SDG</span><input name="usdToSdgRate" type="number" min="0" step="0.0001" required defaultValue={settings?.usd_to_sdg_rate ?? 0} inputMode="decimal" /></label><label className="field"><span className="field-label">هامش الربح %</span><input name="profitMarginPercent" type="number" min="0" max="100" step="0.01" required defaultValue={(settings?.default_profit_margin ?? 0) * 100} inputMode="decimal" /></label><button className="btn btn-primary" type="submit">حفظ إعدادات التسعير</button></form>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
