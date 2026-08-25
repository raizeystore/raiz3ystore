import Link from "next/link";
import { ChevronDown, ChevronLeft, Package, Plus, Save } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
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
    admin.from("subcategories").select("id, name, status").order("sort_order").order("name"),
    admin
      .from("products")
      .select("id, subcategory_id, name, slug, sku, description, image_url, status, sort_order, suboptions_required, base_price_usd")
      .not("subcategory_id", "is", null)
      .order("sort_order")
      .order("name"),
    admin.from("product_variants").select("id, product_id, sku, status"),
    admin.from("store_settings").select("usd_to_sdg_rate, currency").eq("id", 1).maybeSingle(),
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
        <div className={styles.intro}>
          <div><h1>المنتجات</h1><p>أضف المنتج وسعره وصورته، ثم افتح صفحة الأسعار والخيارات عند الحاجة.</p></div>
          <Link className="btn btn-secondary" href="/admin/settings">سعر الصرف</Link>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && (
          <div className="notice notice-error" role="alert">
            {query.error === "image_invalid"
              ? "الصورة غير صالحة. استخدم JPG أو PNG أو WebP حتى 5MB."
              : query.error === "exchange_rate_required"
                ? "اضبط سعر صرف الدولار أولًا من الإعدادات."
                : "تعذر حفظ المنتج. تحقق من الباقة والسعر."}
          </div>
        )}

        <p className="admin-muted">1 USD = {Number(settings?.usd_to_sdg_rate ?? 0).toLocaleString("ar")} {settings?.currency ?? "SDG"}</p>

        <div className="catalog-admin-layout">
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة منتج</h2><p>كل منتج يتبع باقة واحدة</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            {!subcategories.length ? (
              <div className="admin-empty"><strong>أضف باقة أولًا</strong><span>لا يمكن إنشاء منتج بدون باقة.</span></div>
            ) : (
              <form className={styles.form} action={saveCatalogProduct}>
                <label className="field"><span className="field-label">الباقة</span><select className="admin-select" name="subcategoryId" required defaultValue=""><option value="" disabled>اختر الباقة</option>{subcategories.map((subcategory) => <option value={subcategory.id} key={subcategory.id}>{subcategory.name}</option>)}</select></label>
                <label className="field"><span className="field-label">اسم المنتج</span><input name="name" required minLength={2} maxLength={120} /></label>
                <label className="field"><span className="field-label">السعر الأساسي بالدولار (USD)</span><input name="basePriceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
                <label className={styles.fileField}><span className={styles.fileLabel}>صورة المنتج</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>اختياري · حتى 5MB</span></label>
                <label className={styles.toggle}><input type="checkbox" name="suboptionsRequired" /><span><strong>العميل يجب أن يختار نوعًا</strong><small>مثال: حساب موثق فقط أو حساب موثق + فيزا.</small></span></label>
                <input type="hidden" name="status" value="active" />
                <input type="hidden" name="sortOrder" value={products.length} />
                <details className={styles.advanced}>
                  <summary>تفاصيل إضافية</summary>
                  <div className={styles.advancedBody}><label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label></div>
                </details>
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
              <div className="admin-empty"><strong>لا توجد منتجات</strong><span>أضف المنتج الأول من النموذج.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {products.map((product) => {
                  const variantCount = variants.filter((variant) => variant.product_id === product.id && variant.sku !== "__BASE__").length;
                  return (
                    <details className="catalog-edit-item" key={product.id}>
                      <summary>
                        <span className="catalog-edit-main"><strong>{product.name}</strong><small>{product.subcategory_id ? subcategoryNames.get(product.subcategory_id) : "—"} · {Number(product.base_price_usd ?? 0).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · {variantCount.toLocaleString("ar")} خيار</small></span>
                        <span className={`admin-status${product.status === "active" ? " is-success" : product.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(product.status)}</span>
                        <ChevronDown aria-hidden="true" size={18} />
                      </summary>
                      <form className={`${styles.editForm} catalog-edit-form`} action={saveCatalogProduct}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="slug" value={product.slug} />
                        <input type="hidden" name="sku" value={product.sku ?? ""} />
                        <input type="hidden" name="existingImageUrl" value={product.image_url ?? ""} />
                        <label className="field"><span className="field-label">الباقة</span><select className="admin-select" name="subcategoryId" required defaultValue={product.subcategory_id ?? ""}>{subcategories.map((subcategory) => <option value={subcategory.id} key={subcategory.id}>{subcategory.name}</option>)}</select></label>
                        <label className="field"><span className="field-label">اسم المنتج</span><input name="name" required minLength={2} maxLength={120} defaultValue={product.name} /></label>
                        <label className="field"><span className="field-label">السعر الأساسي بالدولار (USD)</span><input name="basePriceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" defaultValue={product.base_price_usd ?? 0} /></label>
                        <label className={styles.fileField}><span className={styles.fileLabel}>تغيير الصورة</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>{product.image_url ? "اتركه فارغًا للإبقاء على الصورة الحالية" : "لا توجد صورة حاليًا"}</span></label>
                        <label className={styles.toggle}><input type="checkbox" name="suboptionsRequired" defaultChecked={product.suboptions_required} /><span><strong>العميل يجب أن يختار نوعًا</strong><small>فعّلها عندما يكون اختيار أحد الأنواع إلزاميًا.</small></span></label>
                        <details className={styles.advanced}>
                          <summary>تفاصيل إضافية</summary>
                          <div className={styles.advancedBody}>
                            <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} defaultValue={product.description ?? ""} /></label>
                            <div className={styles.grid}>
                              <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={product.sort_order} /></label>
                              <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={product.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                            </div>
                          </div>
                        </details>
                        <div className="catalog-form-actions">
                          <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ</button>
                          <Link className="btn btn-secondary" href={`/admin/catalog/products/${product.id}`}>الأسعار والخيارات <ChevronLeft aria-hidden="true" size={17} /></Link>
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
