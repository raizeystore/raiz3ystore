import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
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
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <div className="nav-actions">
            <Link className="btn btn-secondary" href="/admin">لوحة الإدارة</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />PRICING ENGINE</span>
              <h1>المنتجات والتسعير</h1>
              <p>حدد لكل منتج تسعير يدوي أو سعر أساسي بالدولار، واضبط حقول بيانات اللاعب المطلوبة في Checkout.</p>
            </div>
          </div>

          {query.message === "product_updated" && (
            <div className="notice" role="status">تم تحديث المنتج وإعادة احتساب السعر إذا كان التسعير تلقائيًا.</div>
          )}
          {query.error && (
            <div className="notice notice-error" role="alert">
              تعذر حفظ الإعدادات. إذا اخترت التسعير بالدولار تأكد أولًا أن سعر USD→SDG أكبر من صفر في لوحة الإدارة.
            </div>
          )}

          <div className="cta-band" style={{ marginBottom: 24 }}>
            <div>
              <h2>محرك السعر الحالي</h2>
              <p>
                1 USD = {settings?.usd_to_sdg_rate ?? 0} SDG • هامش الربح الافتراضي {((settings?.default_profit_margin ?? 0) * 100).toFixed(2)}%
              </p>
            </div>
            <Link className="btn btn-secondary" href="/admin">تعديل سعر الدولار</Link>
          </div>

          {!products?.length ? (
            <div className="cta-band">
              <div><h2>ما في منتجات لسه</h2><p>أضف أول لعبة ومنتج من لوحة الإدارة، وبعدها تظهر إعداداته هنا.</p></div>
              <Link className="btn btn-primary" href="/admin">إضافة منتج</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {products.map((product) => (
                <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={product.id}>
                  <div className="auth-card-header">
                    <span className="card-kicker">{gameName.get(product.game_id) ?? "GAME"} • {product.status}</span>
                    <h2>{product.name}</h2>
                    <p>السعر الحالي: <strong style={{ color: "var(--brand-strong)" }}>{formatPrice(product.price, product.currency)}</strong></p>
                  </div>

                  <form className="auth-form" action={updateProductSettings}>
                    <input type="hidden" name="productId" value={product.id} />

                    <label className="field">
                      <span className="field-label">طريقة التسعير</span>
                      <select name="pricingMode" defaultValue={product.pricing_mode} style={controlStyle}>
                        <option value="manual">يدوي — السعر النهائي أدخله بنفسي</option>
                        <option value="usd_auto">تلقائي — سعر أساسي USD × الصرف × الربح</option>
                      </select>
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                      <label className="field">
                        <span className="field-label">السعر اليدوي</span>
                        <input name="manualPrice" type="number" min="0" step="0.01" defaultValue={product.price} inputMode="decimal" />
                      </label>
                      <label className="field">
                        <span className="field-label">عملة السعر اليدوي</span>
                        <input name="manualCurrency" maxLength={5} defaultValue={product.currency} dir="ltr" />
                      </label>
                      <label className="field">
                        <span className="field-label">السعر الأساسي USD</span>
                        <input name="basePriceUsd" type="number" min="0" step="0.0001" defaultValue={product.base_price_usd ?? ""} inputMode="decimal" />
                      </label>
                      <label className="field">
                        <span className="field-label">هامش ربح خاص %</span>
                        <input name="profitMarginPercent" type="number" min="0" max="100" step="0.01" defaultValue={product.profit_margin_override === null ? "" : product.profit_margin_override * 100} inputMode="decimal" placeholder="فارغ = الافتراضي" />
                      </label>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: 4 }}>
                      <h3 style={{ marginTop: 0 }}>بيانات اللاعب المطلوبة</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                        <label className="field">
                          <span className="field-label">اسم حقل Player ID</span>
                          <input name="playerIdLabel" maxLength={80} defaultValue={product.player_id_label} />
                        </label>
                        <label className="field">
                          <span className="field-label">اسم حقل اسم اللاعب</span>
                          <input name="playerNameLabel" maxLength={80} defaultValue={product.player_name_label} />
                        </label>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14 }}>
                        <label><input type="checkbox" name="playerIdRequired" defaultChecked={product.player_id_required} /> Player ID مطلوب</label>
                        <label><input type="checkbox" name="playerNameRequired" defaultChecked={product.player_name_required} /> اسم اللاعب مطلوب</label>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <button className="btn btn-primary" type="submit">حفظ إعدادات المنتج</button>
                      <Link className="btn btn-secondary" href={`/products/${product.slug}`}>فتح صفحة العرض</Link>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
