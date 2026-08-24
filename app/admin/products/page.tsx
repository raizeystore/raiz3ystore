import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateProductSettings } from "@/app/admin/products/actions";

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: products }, { data: games }, { data: settings }] = await Promise.all([
    admin
      .from("products")
      .select("id, game_id, name, slug, price, currency, status, pricing_mode, base_price_usd, profit_margin_override, player_id_required, player_name_required, player_id_label, player_name_label")
      .order("sort_order", { ascending: true })
      .order("name"),
    admin.from("games").select("id, name"),
    admin.from("store_settings").select("usd_to_sdg_rate, default_profit_margin, currency").eq("id", 1).maybeSingle(),
  ]);

  const gameName = new Map((games ?? []).map((game) => [game.id, game.name]));

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">PRICING ENGINE</span>
            <h1>المنتجات والتسعير</h1>
            <p>تحكم في طريقة التسعير الحالية وحقول بيانات اللاعب المطلوبة قبل الانتقال إلى Product Variants في Catalog V2</p>
          </div>
          <Link className="btn btn-secondary" href="/admin/settings">سعر الصرف</Link>
        </div>

        {query.message === "product_updated" && <div className="notice" role="status">تم تحديث المنتج وإعادة احتساب السعر عند استخدام التسعير التلقائي</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ الإعدادات تأكد من سعر الصرف والقيم المطلوبة</div>}

        <section className="admin-panel" style={{ marginBottom: 18 }}>
          <div className="admin-panel-head">
            <div><h2>محرك السعر الحالي</h2><p>1 USD = {settings?.usd_to_sdg_rate ?? 0} SDG · هامش الربح الافتراضي {((settings?.default_profit_margin ?? 0) * 100).toFixed(2)}%</p></div>
            <Link className="btn btn-secondary" href="/admin/settings">تعديل الإعدادات</Link>
          </div>
        </section>

        {!products?.length ? (
          <div className="admin-empty"><strong>لا توجد منتجات حتى الآن</strong><span>أضف أول منتج من صفحة إنشاء عناصر الكتالوج الحالي</span><div style={{ marginTop: 14 }}><Link className="btn btn-primary" href="/admin/catalog/new">إضافة منتج</Link></div></div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {products.map((product) => (
              <article className="admin-form-card" style={{ width: "100%", maxWidth: "none" }} key={product.id}>
                <div className="admin-panel-head">
                  <div><h2>{product.name}</h2><p>{gameName.get(product.game_id) ?? "GAME"} · السعر الحالي {formatPrice(product.price, product.currency)}</p></div>
                  <span className={`admin-status${product.status === "active" ? " is-success" : ""}`}>{product.status}</span>
                </div>

                <form className="auth-form" action={updateProductSettings}>
                  <input type="hidden" name="productId" value={product.id} />

                  <label className="field"><span className="field-label">طريقة التسعير</span><select name="pricingMode" defaultValue={product.pricing_mode} style={controlStyle}><option value="manual">يدوي — السعر النهائي أدخله بنفسي</option><option value="usd_auto">تلقائي — USD × سعر الصرف × هامش الربح</option></select></label>

                  <div className="admin-form-grid">
                    <label className="field"><span className="field-label">السعر اليدوي</span><input name="manualPrice" type="number" min="0" step="0.01" defaultValue={product.price} inputMode="decimal" /></label>
                    <label className="field"><span className="field-label">عملة السعر اليدوي</span><input name="manualCurrency" maxLength={5} defaultValue={product.currency} dir="ltr" /></label>
                    <label className="field"><span className="field-label">السعر الأساسي USD</span><input name="basePriceUsd" type="number" min="0" step="0.0001" defaultValue={product.base_price_usd ?? ""} inputMode="decimal" /></label>
                    <label className="field"><span className="field-label">هامش ربح خاص %</span><input name="profitMarginPercent" type="number" min="0" max="100" step="0.01" defaultValue={product.profit_margin_override === null ? "" : product.profit_margin_override * 100} inputMode="decimal" placeholder="فارغ يعني الافتراضي" /></label>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 4 }}>
                    <h3 style={{ marginTop: 0 }}>بيانات اللاعب المطلوبة</h3>
                    <div className="admin-form-grid">
                      <label className="field"><span className="field-label">اسم حقل Player ID</span><input name="playerIdLabel" maxLength={80} defaultValue={product.player_id_label} /></label>
                      <label className="field"><span className="field-label">اسم حقل اسم اللاعب</span><input name="playerNameLabel" maxLength={80} defaultValue={product.player_name_label} /></label>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14 }}><label><input type="checkbox" name="playerIdRequired" defaultChecked={product.player_id_required} /> Player ID مطلوب</label><label><input type="checkbox" name="playerNameRequired" defaultChecked={product.player_name_required} /> اسم اللاعب مطلوب</label></div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}><button className="btn btn-primary" type="submit">حفظ إعدادات المنتج</button><Link className="btn btn-secondary" href={`/products/${product.slug}`}>فتح صفحة العرض</Link></div>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
