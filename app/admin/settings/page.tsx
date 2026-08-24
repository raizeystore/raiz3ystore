import Link from "next/link";
import { CircleDollarSign, Images, Landmark, Settings2 } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createPaymentMethod, updateStoreSettings } from "@/app/admin/actions";

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
  if (message === "settings_updated") return "تم تحديث سعر الصرف وهامش الربح";
  if (message === "payment_method_created") return "تمت إضافة طريقة الدفع";
  return undefined;
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: settings }, { data: methods }] = await Promise.all([
    admin.from("store_settings").select("usd_to_sdg_rate, default_profit_margin, currency, updated_at").eq("id", 1).maybeSingle(),
    admin.from("payment_methods").select("id, name, code, account_label, account_identifier, status, sort_order").order("sort_order").order("name"),
  ]);

  const success = messageText(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">STORE SETTINGS</span>
            <h1>الإعدادات العامة</h1>
            <p>إعدادات التسعير ووسائل الدفع الموجودة حاليًا في النظام مع فصلها عن الصفحة الرئيسية للإدارة</p>
          </div>
        </div>

        <nav className="settings-section-nav" aria-label="أقسام الإعدادات">
          <Link href="/admin/settings"><Settings2 aria-hidden="true" size={17} /> عام وتسعير</Link>
          <Link href="/admin/settings/banners"><Images aria-hidden="true" size={17} /> البنرات</Link>
        </nav>

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ الإعدادات تحقق من القيم وحاول مرة أخرى</div>}

        <section className="admin-form-card">
          <div className="admin-panel-head">
            <div>
              <h2>سعر الصرف والتسعير</h2>
              <p>القيم التي يعتمد عليها التسعير التلقائي للمنتجات المسعرة بالدولار</p>
            </div>
            <span className="admin-link-icon"><CircleDollarSign aria-hidden="true" size={20} strokeWidth={2} /></span>
          </div>

          <form className="auth-form" action={updateStoreSettings}>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field-label">1 USD يساوي كم SDG</span>
                <input name="usdToSdgRate" type="number" min="0" step="0.0001" inputMode="decimal" required defaultValue={settings?.usd_to_sdg_rate ?? 0} />
              </label>
              <label className="field">
                <span className="field-label">هامش الربح الافتراضي %</span>
                <input name="profitMarginPercent" type="number" min="0" max="100" step="0.01" inputMode="decimal" required defaultValue={(settings?.default_profit_margin ?? 0) * 100} />
              </label>
            </div>
            <button className="btn btn-primary" type="submit"><Settings2 aria-hidden="true" size={18} strokeWidth={2} /> حفظ إعدادات التسعير</button>
          </form>
        </section>

        <section className="admin-form-card">
          <div className="admin-panel-head">
            <div>
              <h2>إضافة وسيلة دفع</h2>
              <p>الوسائل الحالية مرتبطة بتدفق التحويل البنكي الموجود الآن وسيتم توسيعها داخل مرحلة المالية</p>
            </div>
            <span className="admin-link-icon"><Landmark aria-hidden="true" size={20} strokeWidth={2} /></span>
          </div>

          <form className="auth-form" action={createPaymentMethod}>
            <div className="admin-form-grid">
              <label className="field"><span className="field-label">اسم الطريقة</span><input name="paymentName" required maxLength={100} placeholder="بنكك أو تحويل بنكي" /></label>
              <label className="field"><span className="field-label">Code</span><input name="paymentCode" required maxLength={40} pattern="[A-Za-z0-9_-]{2,40}" dir="ltr" placeholder="BANKAK" /></label>
              <label className="field"><span className="field-label">اسم الحساب أو الوصف</span><input name="accountLabel" maxLength={120} placeholder="اسم صاحب الحساب" /></label>
              <label className="field"><span className="field-label">رقم الحساب أو المعرف</span><input name="accountIdentifier" required maxLength={180} dir="ltr" /></label>
            </div>
            <label className="field"><span className="field-label">تعليمات الدفع</span><textarea name="paymentInstructions" rows={4} maxLength={1000} style={controlStyle} placeholder="تعليمات واضحة تظهر للعميل" /></label>
            <button className="btn btn-primary" type="submit">إضافة طريقة الدفع</button>
          </form>
        </section>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div><h2>طرق الدفع الحالية</h2><p>عرض سريع للحالة بدون حذف أي سجل</p></div>
          </div>
          {!methods?.length ? (
            <div className="admin-empty"><strong>لا توجد طرق دفع</strong><span>أضف أول طريقة من النموذج أعلاه</span></div>
          ) : (
            <div className="admin-data-list">
              {methods.map((method) => (
                <div className="admin-list-row" key={method.id}>
                  <div className="admin-list-main">
                    <span className="admin-task-icon"><Landmark aria-hidden="true" size={18} strokeWidth={2} /></span>
                    <span><strong>{method.name}</strong><span dir="ltr">{method.account_identifier ?? method.code}</span></span>
                  </div>
                  <span className={`admin-status${method.status === "active" ? " is-success" : ""}`}>{method.status === "active" ? "نشط" : "متوقف"}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
