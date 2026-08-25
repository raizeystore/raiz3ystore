import Link from "next/link";
import { ChevronDown, ChevronLeft, ListChecks, Plus, Save, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveInputField, saveSuboption, saveVariant } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYSTEM_BASE_VARIANT_SKU = "__BASE__";
const DIRECT_PRODUCT_VARIANT = "__product_base__";

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "variant_saved") return "تم حفظ خيار السعر";
  if (message === "suboption_saved") return "تم حفظ النوع الإضافي";
  if (message === "input_field_saved") return "تم حفظ حقل بيانات العميل";
  return null;
}

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!UUID_RE.test(id)) notFound();
  await requireAdmin();
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, status, subcategory_id, suboptions_required, base_price_usd, currency")
    .eq("id", id)
    .maybeSingle();
  if (!product?.subcategory_id) notFound();

  const [subcategoryResult, variantsResult, fieldsResult] = await Promise.all([
    admin.from("subcategories").select("name").eq("id", product.subcategory_id).maybeSingle(),
    admin.from("product_variants").select("id, name, sku, price_usd, status, sort_order").eq("product_id", id).order("sort_order").order("name"),
    admin.from("product_input_fields").select("id, field_key, label, input_type, placeholder, is_required, min_length, max_length, status, sort_order").eq("product_id", id).order("sort_order").order("label"),
  ]);

  const allVariants = variantsResult.data ?? [];
  const visibleVariants = allVariants.filter((variant) => variant.sku !== SYSTEM_BASE_VARIANT_SKU);
  const systemVariant = allVariants.find((variant) => variant.sku === SYSTEM_BASE_VARIANT_SKU) ?? null;
  const fields = fieldsResult.data ?? [];
  const variantIds = allVariants.map((variant) => variant.id);
  const suboptions = variantIds.length
    ? (await admin.from("product_suboptions").select("id, variant_id, name, price_usd, status, sort_order").in("variant_id", variantIds).order("sort_order").order("name")).data ?? []
    : [];
  const success = notice(query.message);

  function parentLabel(variantId: string) {
    if (systemVariant?.id === variantId) return "المنتج مباشرة";
    return visibleVariants.find((variant) => variant.id === variantId)?.name ?? "خيار غير معروف";
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div>
            <h1>{product.name}</h1>
            <p>{subcategoryResult.data?.name ?? "باقة"} · السعر الأساسي {Number(product.base_price_usd ?? 0).toLocaleString("ar", { maximumFractionDigits: 4 })} USD</p>
          </div>
          <div className="catalog-form-actions">
            <Link className="btn btn-secondary" href="/admin/catalog/products">المنتجات</Link>
            <Link className="btn btn-secondary" href={`/products/${product.slug}`}>معاينة</Link>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ التعديل. تحقق من الاسم والسعر والحقول المطلوبة.</div>}

        <section className="catalog-product-summary">
          <span className={`admin-status${product.status === "active" ? " is-success" : ""}`}>{statusLabel(product.status)}</span>
          <span>{visibleVariants.length.toLocaleString("ar")} خيار سعر</span>
          <span>{suboptions.length.toLocaleString("ar")} نوع إضافي</span>
          <span>{fields.length.toLocaleString("ar")} حقل بيانات</span>
          <span>{product.suboptions_required ? "اختيار النوع إجباري" : "اختيار النوع اختياري"}</span>
        </section>

        <div className="product-config-admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>خيارات السعر</h2><p>اختياري. استخدمه عندما يكون للمنتج أحجام مثل 60 UC و660 UC.</p></div>
              <span className="admin-link-icon"><SlidersHorizontal aria-hidden="true" size={20} /></span>
            </div>
            <form className="catalog-inline-create" action={saveVariant}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="field"><span className="field-label">اسم الخيار</span><input name="name" required maxLength={120} placeholder="60 UC" /></label>
              <label className="field"><span className="field-label">السعر بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
              <input type="hidden" name="sortOrder" value={visibleVariants.length} />
              <input type="hidden" name="status" value="active" />
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الخيار</button>
            </form>

            {!visibleVariants.length ? (
              <div className="admin-empty admin-section-gap"><strong>لا توجد خيارات سعر</strong><span>هذا طبيعي إذا كان المنتج له سعر أساسي واحد.</span></div>
            ) : (
              <div className="catalog-edit-list admin-section-gap">
                {visibleVariants.map((variant) => (
                  <details className="catalog-edit-item" key={variant.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{variant.name}</strong><small>{Number(variant.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD</small></span>
                      <span className={`admin-status${variant.status === "active" ? " is-success" : ""}`}>{statusLabel(variant.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveVariant}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="variantId" value={variant.id} />
                      <input type="hidden" name="sku" value={variant.sku ?? ""} />
                      <label className="field"><span className="field-label">اسم الخيار</span><input name="name" required maxLength={120} defaultValue={variant.name} /></label>
                      <label className="field"><span className="field-label">السعر بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={variant.price_usd} /></label>
                      <details className={styles.advanced}>
                        <summary>تفاصيل إضافية</summary>
                        <div className={styles.advancedBody}>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={variant.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={variant.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                          </div>
                        </div>
                      </details>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ</button>
                    </form>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>الأنواع الإضافية</h2><p>اكتب الاسم والسعر مباشرة. مثال: حساب موثق فقط أو حساب موثق + فيزا.</p></div>
              <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
            </div>
            <form className="catalog-inline-create" action={saveSuboption}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="field"><span className="field-label">يظهر بعد</span><select className="admin-select" name="variantId" required defaultValue={DIRECT_PRODUCT_VARIANT}><option value={DIRECT_PRODUCT_VARIANT}>المنتج مباشرة</option>{visibleVariants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
              <label className="field"><span className="field-label">اسم النوع</span><input name="name" required maxLength={120} placeholder="حساب موثق + فيزا" /></label>
              <label className="field"><span className="field-label">سعر هذا النوع بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
              <input type="hidden" name="sortOrder" value={suboptions.length} />
              <input type="hidden" name="status" value="active" />
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة النوع</button>
            </form>

            {!suboptions.length ? (
              <div className="admin-empty admin-section-gap"><strong>لا توجد أنواع إضافية</strong><span>اتركها فارغة إذا لم يحتج المنتج إلى اختيار إضافي.</span></div>
            ) : (
              <div className="catalog-edit-list admin-section-gap">
                {suboptions.map((suboption) => {
                  const direct = systemVariant?.id === suboption.variant_id;
                  return (
                    <details className="catalog-edit-item" key={suboption.id}>
                      <summary>
                        <span className="catalog-edit-main"><strong>{suboption.name}</strong><small>{parentLabel(suboption.variant_id)} · {Number(suboption.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD</small></span>
                        <span className={`admin-status${suboption.status === "active" ? " is-success" : ""}`}>{statusLabel(suboption.status)}</span>
                        <ChevronDown aria-hidden="true" size={18} />
                      </summary>
                      <form className={`${styles.editForm} catalog-edit-form`} action={saveSuboption}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="suboptionId" value={suboption.id} />
                        <label className="field"><span className="field-label">يظهر بعد</span><select className="admin-select" name="variantId" required defaultValue={direct ? DIRECT_PRODUCT_VARIANT : suboption.variant_id}><option value={DIRECT_PRODUCT_VARIANT}>المنتج مباشرة</option>{visibleVariants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
                        <label className="field"><span className="field-label">اسم النوع</span><input name="name" required maxLength={120} defaultValue={suboption.name} /></label>
                        <label className="field"><span className="field-label">السعر بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={suboption.price_usd} /></label>
                        <details className={styles.advanced}>
                          <summary>تفاصيل إضافية</summary>
                          <div className={styles.advancedBody}>
                            <div className={styles.grid}>
                              <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={suboption.sort_order} /></label>
                              <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={suboption.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                            </div>
                          </div>
                        </details>
                        <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ</button>
                      </form>
                    </details>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div><h2>بيانات العميل</h2><p>أضف فقط المعلومات التي يحتاجها تنفيذ الطلب، مثل Player ID أو رقم الحساب.</p></div>
            <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
          </div>
          <form className="catalog-inline-create catalog-inline-create--fields" action={saveInputField}>
            <input type="hidden" name="productId" value={product.id} />
            <label className="field"><span className="field-label">اسم الحقل</span><input name="label" required maxLength={80} placeholder="Player ID" /></label>
            <label className="field"><span className="field-label">نوع البيانات</span><select className="admin-select" name="inputType" defaultValue="text"><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد إلكتروني</option><option value="tel">رقم هاتف</option></select></label>
            <label className="field"><span className="field-label">نص إرشادي داخل الحقل</span><input name="placeholder" maxLength={120} placeholder="اكتب الرقم هنا" /></label>
            <label className={styles.toggle}><input type="checkbox" name="isRequired" /><span><strong>هذا الحقل مطلوب</strong><small>لن يستطيع العميل المتابعة بدونه.</small></span></label>
            <input type="hidden" name="sortOrder" value={fields.length} />
            <input type="hidden" name="status" value="active" />
            <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الحقل</button>
          </form>

          {!fields.length ? (
            <div className="admin-empty admin-section-gap"><strong>لا توجد بيانات إضافية مطلوبة</strong><span>أضف حقلًا فقط إذا احتجت معلومة من العميل.</span></div>
          ) : (
            <div className="catalog-edit-list admin-section-gap">
              {fields.map((field) => (
                <details className="catalog-edit-item" key={field.id}>
                  <summary>
                    <span className="catalog-edit-main"><strong>{field.label}</strong><small>{field.is_required ? "مطلوب" : "اختياري"}</small></span>
                    <span className={`admin-status${field.status === "active" ? " is-success" : ""}`}>{statusLabel(field.status)}</span>
                    <ChevronDown aria-hidden="true" size={18} />
                  </summary>
                  <form className={`${styles.editForm} catalog-edit-form`} action={saveInputField}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="fieldId" value={field.id} />
                    <input type="hidden" name="fieldKey" value={field.field_key} />
                    <label className="field"><span className="field-label">اسم الحقل</span><input name="label" required maxLength={80} defaultValue={field.label} /></label>
                    <label className="field"><span className="field-label">نوع البيانات</span><select className="admin-select" name="inputType" defaultValue={field.input_type}><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد إلكتروني</option><option value="tel">رقم هاتف</option></select></label>
                    <label className="field"><span className="field-label">النص الإرشادي</span><input name="placeholder" maxLength={120} defaultValue={field.placeholder ?? ""} /></label>
                    <label className={styles.toggle}><input type="checkbox" name="isRequired" defaultChecked={field.is_required} /><span><strong>هذا الحقل مطلوب</strong></span></label>
                    <details className={styles.advanced}>
                      <summary>تفاصيل إضافية</summary>
                      <div className={styles.advancedBody}>
                        <div className={styles.grid}>
                          <label className="field"><span className="field-label">أقل طول</span><input name="minLength" type="number" min="0" max="500" defaultValue={field.min_length ?? ""} /></label>
                          <label className="field"><span className="field-label">أقصى طول</span><input name="maxLength" type="number" min="0" max="500" defaultValue={field.max_length ?? ""} /></label>
                          <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={field.sort_order} /></label>
                          <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={field.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                        </div>
                      </div>
                    </details>
                    <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ</button>
                  </form>
                </details>
              ))}
            </div>
          )}
        </section>

        <Link className="admin-back-link" href="/admin/catalog/products">العودة للمنتجات <ChevronLeft aria-hidden="true" size={16} /></Link>
      </div>
    </main>
  );
}
