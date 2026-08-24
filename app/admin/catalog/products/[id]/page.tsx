import Link from "next/link";
import { ChevronDown, ChevronLeft, ListChecks, Plus, Save, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveInputField, saveSuboption, saveVariant } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "variant_saved") return "تم حفظ خيار المنتج";
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
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, status, subcategory_id, suboptions_required, base_price_usd, price, currency")
    .eq("id", id)
    .maybeSingle();
  if (!product?.subcategory_id) notFound();

  const [subcategoryResult, variantsResult, fieldsResult] = await Promise.all([
    admin.from("subcategories").select("name, category_id, categories(name)").eq("id", product.subcategory_id).maybeSingle(),
    admin.from("product_variants").select("id, name, sku, price_usd, status, sort_order").eq("product_id", id).order("sort_order").order("name"),
    admin.from("product_input_fields").select("id, field_key, label, input_type, placeholder, is_required, min_length, max_length, status, sort_order").eq("product_id", id).order("sort_order").order("label"),
  ]);
  const variants = variantsResult.data ?? [];
  const fields = fieldsResult.data ?? [];
  const variantIds = variants.map((variant) => variant.id);
  const suboptions = variantIds.length
    ? (await admin.from("product_suboptions").select("id, variant_id, name, price_usd, status, sort_order").in("variant_id", variantIds).order("sort_order").order("name")).data ?? []
    : [];
  const variantNames = new Map(variants.map((variant) => [variant.id, variant.name]));
  const success = notice(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">PRODUCT CONFIGURATION</span>
            <h1>{product.name}</h1>
            <p>{subcategoryResult.data?.name ?? "باقة"} · السعر الأساسي {Number(product.base_price_usd ?? 0).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · السعر المحسوب {Number(product.price).toLocaleString("ar")} {product.currency}</p>
          </div>
          <div className="catalog-form-actions">
            <Link className="btn btn-secondary" href="/admin/catalog/products">كل المنتجات</Link>
            <Link className="btn btn-secondary" href={`/products/${product.slug}`}>معاينة العميل</Link>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ التعديل. تحقق من الربط والقيم وعدم تكرار الاسم أو SKU.</div>}

        <section className="catalog-product-summary">
          <span className={`admin-status${product.status === "active" ? " is-success" : ""}`}>{statusLabel(product.status)}</span>
          <span>{variants.length.toLocaleString("ar")} خيار رئيسي</span>
          <span>{suboptions.length.toLocaleString("ar")} خيار فرعي</span>
          <span>{fields.length.toLocaleString("ar")} حقل عميل</span>
          <span>{product.suboptions_required ? "الخيار الفرعي إجباري" : "الخيار الفرعي غير إجباري"}</span>
        </section>

        <div className="product-config-admin-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>الخيارات الرئيسية</h2><p>مثل 60 UC أو 325 UC. سعر كل خيار مطلق بالدولار.</p></div>
              <span className="admin-link-icon"><SlidersHorizontal aria-hidden="true" size={20} /></span>
            </div>
            <form className="catalog-inline-create" action={saveVariant}>
              <input type="hidden" name="productId" value={product.id} />
              <label className="field"><span className="field-label">اسم الخيار</span><input name="name" required maxLength={120} placeholder="60 UC" /></label>
              <label className="field"><span className="field-label">السعر USD</span><input name="priceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
              <label className="field"><span className="field-label">SKU اختياري</span><input name="sku" maxLength={80} dir="ltr" /></label>
              <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" /></label>
              <input type="hidden" name="status" value="active" />
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الخيار</button>
            </form>

            {!variants.length ? (
              <div className="admin-empty admin-section-gap"><strong>لا توجد خيارات</strong><span>المنتج البسيط يعمل بالسعر الأساسي حتى بدون خيارات.</span></div>
            ) : (
              <div className="catalog-edit-list admin-section-gap">
                {variants.map((variant) => (
                  <details className="catalog-edit-item" key={variant.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{variant.name}</strong><small>{Number(variant.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · {suboptions.filter((item) => item.variant_id === variant.id).length.toLocaleString("ar")} فرعي</small></span>
                      <span className={`admin-status${variant.status === "active" ? " is-success" : ""}`}>{statusLabel(variant.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className="auth-form catalog-edit-form" action={saveVariant}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="variantId" value={variant.id} />
                      <div className="admin-form-grid">
                        <label className="field"><span className="field-label">الاسم</span><input name="name" required maxLength={120} defaultValue={variant.name} /></label>
                        <label className="field"><span className="field-label">السعر USD</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={variant.price_usd} /></label>
                        <label className="field"><span className="field-label">SKU</span><input name="sku" maxLength={80} dir="ltr" defaultValue={variant.sku ?? ""} /></label>
                        <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={variant.sort_order} /></label>
                        <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={variant.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      </div>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الخيار</button>
                    </form>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h2>الخيارات الفرعية</h2><p>سعر الخيار الفرعي يستبدل سعر الخيار الرئيسي ولا يُضاف إليه.</p></div>
              <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
            </div>
            {!variants.length ? (
              <div className="admin-empty"><strong>أضف خيارًا رئيسيًا أولًا</strong><span>الخيار الفرعي يجب أن يرتبط بخيار رئيسي واحد.</span></div>
            ) : (
              <>
                <form className="catalog-inline-create" action={saveSuboption}>
                  <input type="hidden" name="productId" value={product.id} />
                  <label className="field"><span className="field-label">الخيار الرئيسي</span><select className="admin-select" name="variantId" required defaultValue=""><option value="" disabled>اختر الخيار</option>{variants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
                  <label className="field"><span className="field-label">اسم الخيار الفرعي</span><input name="name" required maxLength={120} placeholder="Korea" /></label>
                  <label className="field"><span className="field-label">السعر المطلق USD</span><input name="priceUsd" type="number" min="0" step="0.0001" required /></label>
                  <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" /></label>
                  <input type="hidden" name="status" value="active" />
                  <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الفرعي</button>
                </form>

                {!suboptions.length ? (
                  <div className="admin-empty admin-section-gap"><strong>لا توجد خيارات فرعية</strong><span>اتركها فارغة إذا كان المنتج لا يحتاجها.</span></div>
                ) : (
                  <div className="catalog-edit-list admin-section-gap">
                    {suboptions.map((suboption) => (
                      <details className="catalog-edit-item" key={suboption.id}>
                        <summary>
                          <span className="catalog-edit-main"><strong>{suboption.name}</strong><small>{variantNames.get(suboption.variant_id)} · {Number(suboption.price_usd).toLocaleString("ar", { maximumFractionDigits: 4 })} USD</small></span>
                          <span className={`admin-status${suboption.status === "active" ? " is-success" : ""}`}>{statusLabel(suboption.status)}</span>
                          <ChevronDown aria-hidden="true" size={18} />
                        </summary>
                        <form className="auth-form catalog-edit-form" action={saveSuboption}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="suboptionId" value={suboption.id} />
                          <div className="admin-form-grid">
                            <label className="field"><span className="field-label">الخيار الرئيسي</span><select className="admin-select" name="variantId" required defaultValue={suboption.variant_id}>{variants.map((variant) => <option value={variant.id} key={variant.id}>{variant.name}</option>)}</select></label>
                            <label className="field"><span className="field-label">الاسم</span><input name="name" required maxLength={120} defaultValue={suboption.name} /></label>
                            <label className="field"><span className="field-label">السعر USD</span><input name="priceUsd" type="number" min="0" step="0.0001" required defaultValue={suboption.price_usd} /></label>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={suboption.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={suboption.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                          </div>
                          <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الفرعي</button>
                        </form>
                      </details>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div><h2>حقول بيانات العميل</h2><p>حقول مستقلة مرتبطة بالمنتج مثل Player ID أو رقم الحساب.</p></div>
            <span className="admin-link-icon"><ListChecks aria-hidden="true" size={20} /></span>
          </div>
          <form className="catalog-inline-create catalog-inline-create--fields" action={saveInputField}>
            <input type="hidden" name="productId" value={product.id} />
            <label className="field"><span className="field-label">المفتاح</span><input name="fieldKey" required maxLength={40} pattern="[a-z][a-z0-9_]{0,39}" dir="ltr" placeholder="player_id" /></label>
            <label className="field"><span className="field-label">العنوان</span><input name="label" required maxLength={80} placeholder="Player ID" /></label>
            <label className="field"><span className="field-label">النوع</span><select className="admin-select" name="inputType" defaultValue="text"><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد</option><option value="tel">هاتف</option></select></label>
            <label className="field"><span className="field-label">Placeholder</span><input name="placeholder" maxLength={120} /></label>
            <label className="field"><span className="field-label">أقل طول</span><input name="minLength" type="number" min="0" max="500" /></label>
            <label className="field"><span className="field-label">أقصى طول</span><input name="maxLength" type="number" min="1" max="500" /></label>
            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" /></label>
            <label className="catalog-check"><input type="checkbox" name="isRequired" /> حقل مطلوب</label>
            <input type="hidden" name="status" value="active" />
            <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الحقل</button>
          </form>

          {!fields.length ? (
            <div className="admin-empty admin-section-gap"><strong>لا توجد حقول مخصصة</strong><span>المنتج يمكن أن يعمل بدون بيانات عميل إذا لم يحتجها.</span></div>
          ) : (
            <div className="catalog-edit-list admin-section-gap">
              {fields.map((field) => (
                <details className="catalog-edit-item" key={field.id}>
                  <summary>
                    <span className="catalog-edit-main"><strong>{field.label}</strong><small>{field.field_key} · {field.input_type}{field.is_required ? " · مطلوب" : ""}</small></span>
                    <span className={`admin-status${field.status === "active" ? " is-success" : ""}`}>{statusLabel(field.status)}</span>
                    <ChevronDown aria-hidden="true" size={18} />
                  </summary>
                  <form className="auth-form catalog-edit-form" action={saveInputField}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="fieldId" value={field.id} />
                    <div className="admin-form-grid">
                      <label className="field"><span className="field-label">المفتاح</span><input name="fieldKey" required maxLength={40} pattern="[a-z][a-z0-9_]{0,39}" dir="ltr" defaultValue={field.field_key} /></label>
                      <label className="field"><span className="field-label">العنوان</span><input name="label" required maxLength={80} defaultValue={field.label} /></label>
                      <label className="field"><span className="field-label">النوع</span><select className="admin-select" name="inputType" defaultValue={field.input_type}><option value="text">نص</option><option value="number">رقم</option><option value="email">بريد</option><option value="tel">هاتف</option></select></label>
                      <label className="field"><span className="field-label">Placeholder</span><input name="placeholder" maxLength={120} defaultValue={field.placeholder ?? ""} /></label>
                      <label className="field"><span className="field-label">أقل طول</span><input name="minLength" type="number" min="0" max="500" defaultValue={field.min_length ?? ""} /></label>
                      <label className="field"><span className="field-label">أقصى طول</span><input name="maxLength" type="number" min="1" max="500" defaultValue={field.max_length ?? ""} /></label>
                      <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={field.sort_order} /></label>
                      <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={field.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                    </div>
                    <label className="catalog-check"><input type="checkbox" name="isRequired" defaultChecked={field.is_required} /> حقل مطلوب</label>
                    <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الحقل</button>
                  </form>
                </details>
              ))}
            </div>
          )}
        </section>

        <div className="catalog-back-link"><Link href="/admin/catalog/products"><ChevronLeft aria-hidden="true" size={17} /> العودة للمنتجات</Link></div>
      </div>
    </main>
  );
}
