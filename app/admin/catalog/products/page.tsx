import Link from "next/link";
import { ChevronDown, ChevronLeft, Package, Plus, Save, Settings2 } from "lucide-react";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveCatalogProduct } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "product_created") return "تمت إضافة المنتج";
  if (message === "product_updated") return "تم تحديث المنتج";
  return null;
}

export default async function AdminCatalogProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();
  const [subcategoriesResult, productsResult, variantsResult, settingsResult] = await Promise.all([
    admin
      .from("subcategories")
      .select("id, category_id, name, status, categories(name)")
      .order("sort_order")
      .order("name"),
    admin
      .from("products")
      .select("id, subcategory_id, name, slug, sku, description, image_url, status, sort_order, suboptions_required, base_price_usd, price, currency")
      .not("subcategory_id", "is", null)
      .order("sort_order")
      .order("name"),
    admin.from("product_variants").select("id, product_id, status"),
    admin.from("store_settings").select("usd_to_sdg_rate, default_profit_margin, currency").eq("id", 1).maybeSingle(),
  ]);
  const subcategories = subcategoriesResult.data ?? [];
  const products = productsResult.data ?? [];
  const variants = variantsResult.data ?? [];
  const settings = settingsResult.data;
  const subcategoryNames = new Map(subcategories.map((item) => [item.id, item.name]));
  const success = notice(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CATALOG / PRODUCTS</span>
            <h1>المنتجات والخيارات</h1>
            <p>كل منتج مرتبط بباقة واحدة. الأحجام والأسعار النهائية تُدار كخيارات داخل صفحة المنتج.</p>
          </div>
          <Link className="btn btn-secondary" href="/admin/settings">إعدادات التسعير</Link>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && (
          <div className="notice notice-error" role="alert">
            {query.error === "exchange_rate_required"
              ? "اضبط سعر صرف USD إلى SDG أولًا من الإعدادات."
              : "تعذر حفظ المنتج. تحقق من الباقة والرابط والأسعار."}
          </div>
        )}

        <section className="catalog-pricing-strip">
          <Settings2 aria-hidden="true" size={20} />
          <span>
            1 USD = {Number(settings?.usd_to_sdg_rate ?? 0).toLocaleString("ar")} {settings?.currency ?? "SDG"}
            {" · "}هامش الربح الافتراضي {((Number(settings?.default_profit_margin ?? 0)) * 100).toLocaleString("ar", { maximumFractionDigits: 2 })}%
          </span>
        </section>

        <div className="catalog-admin-layout">
          <section className="admin-form-card catalog-create-card">
            <div className="admin-panel-head">
              <div><h2>إضافة منتج</h2><p>مثل شحن PUBG داخل باقة PUBG Mobile</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            {!subcategories.length ? (
              <div className="admin-empty"><strong>أضف باقة أولًا</strong><span>لا يمكن إنشاء منتج بدون باقة مرتبطة.</span></div>
            ) : (
              <form className="auth-form" action={saveCatalogProduct}>
                <div className="admin-form-grid">
                  <label className="field"><span className="field-label">الباقة</span><select className="admin-select" name="subcategoryId" required defaultValue=""><option value="" disabled>اختر الباقة</option>{subcategories.map((subcategory) => <option value={subcategory.id} key={subcategory.id}>{subcategory.name}{subcategory.status !== "active" ? " — غير نشطة" : ""}</option>)}</select></label>
                  <label className="field"><span className="field-label">اسم المنتج</span><input name="name" required minLength={2} maxLength={120} /></label>
                  <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label>
                  <label className="field"><span className="field-label">SKU اختياري</span><input name="sku" maxLength={80} dir="ltr" /></label>
                  <label className="field"><span className="field-label">السعر الأساسي USD</span><input name="basePriceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
                  <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" placeholder="https://" /></label>
                  <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" inputMode="numeric" /></label>
                  <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue="active"><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                </div>
                <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} /></label>
                <label className="catalog-toggle"><input type="checkbox" name="suboptionsRequired" /><span><strong>تفعيل الخيارات الفرعية الإجبارية</strong><small>عند تشغيله لا يستطيع العميل المتابعة قبل اختيار خيار فرعي متاح.</small></span></label>
                <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة المنتج</button>
              </form>
            )}
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>المنتجات الحالية</h2><p>{products.length.toLocaleString("ar")} منتج</p></div>
              <span className="admin-link-icon"><Package aria-hidden="true" size={20} /></span>
            </div>
            {!products.length ? (
              <div className="admin-empty"><strong>لا توجد منتجات Catalog V2</strong><span>المنتجات القديمة باقية للتوافق ولن تظهر هنا.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {products.map((product) => {
                  const variantCount = variants.filter((variant) => variant.product_id === product.id).length;
                  return (
                    <details className="catalog-edit-item" key={product.id}>
                      <summary>
                        <span className="catalog-edit-main"><strong>{product.name}</strong><small>{product.subcategory_id ? subcategoryNames.get(product.subcategory_id) : "—"} · {variantCount.toLocaleString("ar")} خيار</small></span>
                        <span className={`admin-status${product.status === "active" ? " is-success" : product.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(product.status)}</span>
                        <ChevronDown aria-hidden="true" size={18} />
                      </summary>
                      <form className="auth-form catalog-edit-form" action={saveCatalogProduct}>
                        <input type="hidden" name="productId" value={product.id} />
                        <div className="admin-form-grid">
                          <label className="field"><span className="field-label">الباقة</span><select className="admin-select" name="subcategoryId" required defaultValue={product.subcategory_id ?? ""}>{subcategories.map((subcategory) => <option value={subcategory.id} key={subcategory.id}>{subcategory.name}</option>)}</select></label>
                          <label className="field"><span className="field-label">اسم المنتج</span><input name="name" required minLength={2} maxLength={120} defaultValue={product.name} /></label>
                          <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={product.slug} /></label>
                          <label className="field"><span className="field-label">SKU</span><input name="sku" maxLength={80} dir="ltr" defaultValue={product.sku ?? ""} /></label>
                          <label className="field"><span className="field-label">السعر الأساسي USD</span><input name="basePriceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" defaultValue={product.base_price_usd ?? 0} /></label>
                          <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" defaultValue={product.image_url ?? ""} /></label>
                          <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={product.sort_order} inputMode="numeric" /></label>
                          <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={product.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                        </div>
                        <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} defaultValue={product.description ?? ""} /></label>
                        <label className="catalog-toggle"><input type="checkbox" name="suboptionsRequired" defaultChecked={product.suboptions_required} /><span><strong>الخيارات الفرعية إجبارية</strong><small>فعّلها فقط عندما يجب اختيار خيار فرعي بعد الخيار الرئيسي.</small></span></label>
                        <div className="catalog-form-actions">
                          <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ المنتج</button>
                          <Link className="btn btn-secondary" href={`/admin/catalog/products/${product.id}`}>الخيارات والحقول <ChevronLeft aria-hidden="true" size={17} /></Link>
                        </div>
                      </form>
                    </details>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
