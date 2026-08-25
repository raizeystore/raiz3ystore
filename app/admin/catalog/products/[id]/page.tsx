import Link from "next/link";
import { ChevronDown, ListChecks, Plus, Save, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveInputField } from "@/app/admin/catalog/v2-actions";
import { saveSuboptionV2, saveVariantV2 } from "@/app/admin/catalog/product-option-actions";
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
  if (message === "variant_saved") return "تم حفظ العرض";
  if (message === "suboption_saved") return "تم حفظ الخيار الفرعي";
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
  const admin = createAdminClient() as unknown as SupabaseClient;

  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, status, subcategory_id, suboptions_required, base_price_usd, currency")
    .eq("id", id)
    .maybeSingle();
  if (!product?.subcategory_id) notFound();

  const [subcategoryResult, variantsResult, fieldsResult] = await Promise.all([
    admin.from("subcategories").select("name").eq("id", product.subcategory_id).maybeSingle(),
    admin
      .from("product_variants")
      .select("id, name, sku, price_usd, suboptions_required, status, sort_order")
      .eq("product_id", id)
      .order("sort_order")
      .order("name"),
    admin
      .from("product_input_fields")
      .select("id, field_key, label, input_type, placeholder, is_required, min_length, max_length, status, sort_order")
      .eq("product_id", id)
      .order("sort_order")
      .order("label"),
  ]);

  const allVariants = variantsResult.data ?? [];
  const visibleVariants = allVariants.filter((variant) => variant.sku !== SYSTEM_BASE_VARIANT_SKU);
  const systemVariant = allVariants.find((variant) => variant.sku === SYSTEM_BASE_VARIANT_SKU) ?? null;
  const fields = fieldsResult.data ?? [];
  const variantIds = allVariants.map((variant) => variant.id);
  const { data: suboptionRows } = variantIds.length
    ? await admin
        .from("product_suboptions")
        .select("id, variant_id, name, price_usd, applies_to_all_variants, price_mode, status, sort_order")
        .in("variant_id", variantIds)
        .order("sort_order")
        .order("name")
    : { data: [] };
  const suboptions = suboptionRows ?? [];
  const success = notice(query.message);

  function parentLabel(suboption: (typeof suboptions)[number]) {
    if (suboption.applies_to_all_variants) return "كل العروض";
    if (systemVariant?.id === suboption.variant_id) return "المنتج الأساسي";
    return visibleVariants.find((variant) => variant.id === suboption.variant_id)?.name ?? "عرض غير معروف";
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div>
            <h1>{product.name}</h1>
            <p>{subcategoryResult.data?.name ?? "تصنيف"} · هنا تضيف 60 و325 و660 وغيرها داخل منتج واحد.</p>
          </div>
          <div className="catalog-form-actions">
            <Link className="btn btn-secondary" href="/admin/catalog/products">المنتجات</Link>
            <Link className="btn btn-secondary" href={`/products/${product.slug}`}>معاينة صفحة العميل</Link>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ التعديل. تحقق من العرض والسعر والخيارات المطلوبة.</div>}

        <section className="catalog-product-summary">
          <span className={`admin-status${product.status === "active" ? " is-success" : ""}`}>{statusLabel(product.status)}</span>
          <span>{visibleVariants.length.toLocaleString("ar")} عرض</span>
          <span>{suboptions.length.toLocaleString("ar")} خيار فرعي</span>
          <span>{fields.length.toLocaleString("ar")} حقل تنفيذ</span>
        </section>

        <div className="product-config-admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>العروض والأسعار</h2><p>مثال: 60 UC و325 UC و660 UC. كل عرض له سعره وشرط الخيار الفرعي الخاص به.</p></div>
              <span className="admin-link-icon"><SlidersHorizontal aria-hidden="true" size={20} /></span>
            </div>
            <form className="catalog-inline-create" action={saveVariantV2}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="field"><span className="field-label">اسم العرض</span><input name="name" required maxLength={120} placeholder="60 UC" /></label>
              <label className="field"><span className="field-label">السعر بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
              <label className={styles.toggle}>
                <input type="checkbox" name="suboptionsRequired" />
                <span><strong>الخيار الفرعي إجباري لهذا العرض</strong><small>فعّله مثلًا لـ60 UC فقط واترك 660 UC بدون تفعيل إذا أردت.</small></span>
              </label>
              <input type="hidden" name="sortOrder" value={visibleVariants.length} />
              <input type="hidden" name="status" value="active" />
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة العرض</button>
            </form>

            {!visibleVariants.length ? (
              <div className="admin-empty admin-section-gap"><strong>لا توجد عروض بعد</strong><span>أضف أول عرض مثل 60 UC من النموذج أعلاه.</span></div>
            ) : (
              <div className="catalog-edit-list admin-section-gap">
                {visibleVariants.map((variant) => (
                  <details className="catalog-edit-item" key={variant.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{variant.name}</strong><small>{Number(variant.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · {variant.suboptions_required ? "الخيار الفرعي مطلوب" : "بدون شرط فرعي"}</small></span>
                      <span className={`admin-status${variant.status === "active" ? " is-success" : ""}`}>{statusLabel(variant.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveVariantV2}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="variantId" value={variant.id} />
                      <input type="hidden" name="sku" value={variant.sku ?? ""} />
                      <label className="field"><span className="field-label">اسم العرض</span><input name="name" required maxLength={120} defaultValue={variant.name} /></label>
                      <label className="field"><span className="field-label">السعر بالدولار (USD)</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={variant.price_usd} /></label>
                      <label className={styles.toggle}>
                        <input type="checkbox" name="suboptionsRequired" defaultChecked={Boolean(variant.suboptions_required)} />
                        <span><strong>الخيار الفرعي إجباري لهذا العرض</strong><small>يمنع العميل من المتابعة حتى يختار النوع المربوط بهذا العرض أو خيارًا عامًا.</small></span>
                      </label>
                      <details className={styles.advanced}>
                        <summary>الترتيب والحالة</summary>
                        <div className={styles.advancedBody}>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={variant.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={variant.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                          </div>
                        </div>
                      </details>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ العرض</button>
                    </form>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>الخيارات الفرعية</h2><p>للخيار الخاص بعرض واحد: السعر المكتوب هو السعر النهائي. للخيار العام: السعر المكتوب زيادة USD تُضاف لأي عرض.</p></div>
              <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
            </div>
            <form className="catalog-inline-create" action={saveSuboptionV2}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="field"><span className="field-label">يظهر بعد</span><select className="admin-select" name="variantId" required defaultValue={DIRECT_PRODUCT_VARIANT}><option value={DIRECT_PRODUCT_VARIANT}>المنتج الأساسي</option>{visibleVariants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
              <label className="field"><span className="field-label">اسم الخيار</span><input name="name" required maxLength={120} placeholder="حساب موثق + فيزا" /></label>
              <label className="field"><span className="field-label">السعر / الزيادة بالدولار</span><input name="priceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
              <label className={styles.toggle}>
                <input type="checkbox" name="applyToAllVariants" />
                <span><strong>تطبيق على جميع عروض المنتج</strong><small>عند تفعيله يتم تجاهل اختيار «يظهر بعد» ويُعامل السعر كزيادة فوق سعر كل عرض.</small></span>
              </label>
              <input type="hidden" name="sortOrder" value={suboptions.length} />
              <input type="hidden" name="status" value="active" />
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الخيار</button>
            </form>

            {!suboptions.length ? (
              <div className="admin-empty admin-section-gap"><strong>لا توجد خيارات فرعية</strong><span>أضفها فقط للمنتجات التي تحتاج نوعًا إضافيًا.</span></div>
            ) : (
              <div className="catalog-edit-list admin-section-gap">
                {suboptions.map((suboption) => (
                  <details className="catalog-edit-item" key={suboption.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{suboption.name}</strong><small>{parentLabel(suboption)} · {Number(suboption.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · {suboption.price_mode === "delta" ? "زيادة" : "سعر نهائي"}</small></span>
                      <span className={`admin-status${suboption.status === "active" ? " is-success" : ""}`}>{statusLabel(suboption.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveSuboptionV2}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="suboptionId" value={suboption.id} />
                      <label className="field"><span className="field-label">يظهر بعد</span><select className="admin-select" name="variantId" required defaultValue={systemVariant?.id === suboption.variant_id ? DIRECT_PRODUCT_VARIANT : suboption.variant_id}><option value={DIRECT_PRODUCT_VARIANT}>المنتج الأساسي</option>{visibleVariants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
                      <label className="field"><span className="field-label">اسم الخيار</span><input name="name" required maxLength={120} defaultValue={suboption.name} /></label>
                      <label className="field"><span className="field-label">السعر / الزيادة بالدولار</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={suboption.price_usd} /></label>
                      <label className={styles.toggle}>
                        <input type="checkbox" name="applyToAllVariants" defaultChecked={Boolean(suboption.applies_to_all_variants)} />
                        <span><strong>تطبيق على جميع عروض المنتج</strong><small>الخيار العام يُضاف سعره إلى العرض المختار؛ الخيار الخاص يستبدل السعر بسعرك النهائي المكتوب.</small></span>
                      </label>
                      <details className={styles.advanced}>
                        <summary>الترتيب والحالة</summary>
                        <div className={styles.advancedBody}>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={suboption.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={suboption.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                          </div>
                        </div>
                      </details>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الخيار</button>
                    </form>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div><h2>بيانات التنفيذ</h2><p>هذه الحقول تظهر في Checkout بعد أن يختار العميل العرض والكمية.</p></div>
            <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
          </div>
          <form className="catalog-inline-create catalog-inline-create--fields" action={saveInputField}>
            <input type="hidden" name="productId" value={product.id} />
            <label className="field"><span className="field-label">اسم الحقل</span><input name="label" required maxLength={80} placeholder="Player ID" /></label>
            <label className="field"><span className="field-label">نوع البيانات</span><select className="admin-select" name="inputType" defaultValue="text"><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد</option><option value="tel">هاتف</option></select></label>
            <label className="field"><span className="field-label">النص الإرشادي</span><input name="placeholder" maxLength={120} placeholder="أدخل معرف اللاعب" /></label>
            <label className={styles.toggle}><input type="checkbox" name="isRequired" defaultChecked /><span><strong>الحقل إجباري</strong><small>لن ينشئ السيرفر الطلب إذا تُرك الحقل المطلوب فارغًا.</small></span></label>
            <input type="hidden" name="sortOrder" value={fields.length} />
            <input type="hidden" name="status" value="active" />
            <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الحقل</button>
          </form>

          {fields.length > 0 && (
            <div className="catalog-edit-list admin-section-gap">
              {fields.map((field) => (
                <details className="catalog-edit-item" key={field.id}>
                  <summary>
                    <span className="catalog-edit-main"><strong>{field.label}</strong><small>{field.input_type} · {field.is_required ? "مطلوب" : "اختياري"}</small></span>
                    <span className={`admin-status${field.status === "active" ? " is-success" : ""}`}>{statusLabel(field.status)}</span>
                    <ChevronDown aria-hidden="true" size={18} />
                  </summary>
                  <form className={`${styles.editForm} catalog-edit-form`} action={saveInputField}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="fieldId" value={field.id} />
                    <input type="hidden" name="fieldKey" value={field.field_key} />
                    <label className="field"><span className="field-label">اسم الحقل</span><input name="label" required maxLength={80} defaultValue={field.label} /></label>
                    <label className="field"><span className="field-label">نوع البيانات</span><select className="admin-select" name="inputType" defaultValue={field.input_type}><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد</option><option value="tel">هاتف</option></select></label>
                    <label className="field"><span className="field-label">النص الإرشادي</span><input name="placeholder" maxLength={120} defaultValue={field.placeholder ?? ""} /></label>
                    <label className={styles.toggle}><input type="checkbox" name="isRequired" defaultChecked={Boolean(field.is_required)} /><span><strong>الحقل إجباري</strong></span></label>
                    <div className={styles.grid}>
                      <label className="field"><span className="field-label">أقل طول</span><input name="minLength" type="number" min="0" max="500" defaultValue={field.min_length ?? ""} /></label>
                      <label className="field"><span className="field-label">أقصى طول</span><input name="maxLength" type="number" min="1" max="500" defaultValue={field.max_length ?? ""} /></label>
                      <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={field.sort_order} /></label>
                      <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={field.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                    </div>
                    <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الحقل</button>
                  </form>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
