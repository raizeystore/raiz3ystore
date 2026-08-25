import Link from "next/link";
import { ChevronLeft, PackagePlus } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { saveCatalogProduct, saveCategory, saveSubcategory } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();

  const [categoriesResult, subcategoriesResult, productsResult, settingsResult] = await Promise.all([
    admin.from("categories").select("id, name, status, sort_order").order("sort_order").order("name"),
    admin.from("subcategories").select("id, category_id, name, status, sort_order").order("sort_order").order("name"),
    admin
      .from("products")
      .select("id, subcategory_id, name, status, sort_order, base_price_usd, suboptions_required")
      .not("subcategory_id", "is", null)
      .order("sort_order")
      .order("name"),
    admin.from("store_settings").select("usd_to_sdg_rate, currency").eq("id", 1).maybeSingle(),
  ]);

  const categories = categoriesResult.data ?? [];
  const subcategories = subcategoriesResult.data ?? [];
  const products = productsResult.data ?? [];
  const settings = settingsResult.data;

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div>
            <h1>إدارة الكتالوج</h1>
            <p>أضف القسم ثم الباقة ثم المنتج من نفس الصفحة. التفاصيل التقنية تُنشأ تلقائيًا.</p>
          </div>
          <Link className="btn btn-secondary" href="/">عرض المتجر</Link>
        </div>

        {query.message && <div className="notice" role="status">تم حفظ التعديل بنجاح.</div>}
        {query.error && (
          <div className="notice notice-error" role="alert">
            {query.error === "image_invalid"
              ? "تعذر رفع الصورة. استخدم JPG أو PNG أو WebP بحجم لا يتجاوز 5MB."
              : query.error === "exchange_rate_required"
                ? "اضبط سعر صرف الدولار أولًا من الإعدادات."
                : "تعذر الحفظ. تحقق من الحقول المطلوبة وحاول مرة أخرى."}
          </div>
        )}

        <section className={styles.flow} aria-label="خطوات إضافة الكتالوج">
          <details className={styles.step} open={!categories.length}>
            <summary className={styles.stepSummary}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepCopy}><strong>أضف قسمًا</strong><span>مثل الألعاب أو الاشتراكات</span></span>
              <span className={styles.stepCount}>{categories.length.toLocaleString("ar")}</span>
            </summary>
            <div className={styles.stepBody}>
              <form className={styles.form} action={saveCategory}>
                <div className={styles.grid}>
                  <label className="field"><span className="field-label">اسم القسم</span><input name="name" required minLength={2} maxLength={120} placeholder="الألعاب" /></label>
                  <label className={styles.fileField}>
                    <span className={styles.fileLabel}>صورة القسم</span>
                    <input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
                    <span className={styles.fileHint}>اختياري · JPG أو PNG أو WebP · حتى 5MB</span>
                  </label>
                </div>
                <input type="hidden" name="status" value="active" />
                <input type="hidden" name="sortOrder" value={categories.length} />
                <details className={styles.advanced}>
                  <summary>تفاصيل إضافية</summary>
                  <div className={styles.advancedBody}>
                    <label className="field"><span className="field-label">وصف مختصر</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label>
                  </div>
                </details>
                <button className="btn btn-primary" type="submit">إضافة القسم</button>
              </form>
            </div>
          </details>

          <details className={styles.step} open={categories.length > 0 && !subcategories.length}>
            <summary className={styles.stepSummary}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepCopy}><strong>أضف باقة</strong><span>مثل PUBG Mobile داخل الألعاب</span></span>
              <span className={styles.stepCount}>{subcategories.length.toLocaleString("ar")}</span>
            </summary>
            <div className={styles.stepBody}>
              {!categories.length ? (
                <div className="admin-empty"><strong>أضف قسمًا أولًا</strong><span>الباقة يجب أن تكون داخل قسم.</span></div>
              ) : (
                <form className={styles.form} action={saveSubcategory}>
                  <div className={styles.grid}>
                    <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue=""><option value="" disabled>اختر القسم</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                    <label className="field"><span className="field-label">اسم الباقة</span><input name="name" required minLength={2} maxLength={120} placeholder="PUBG Mobile" /></label>
                    <label className={styles.fileField}>
                      <span className={styles.fileLabel}>صورة الباقة</span>
                      <input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
                      <span className={styles.fileHint}>اختياري · حتى 5MB</span>
                    </label>
                  </div>
                  <input type="hidden" name="status" value="active" />
                  <input type="hidden" name="sortOrder" value={subcategories.length} />
                  <details className={styles.advanced}>
                    <summary>تفاصيل إضافية</summary>
                    <div className={styles.advancedBody}>
                      <label className="field"><span className="field-label">وصف مختصر</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label>
                    </div>
                  </details>
                  <button className="btn btn-primary" type="submit">إضافة الباقة</button>
                </form>
              )}
            </div>
          </details>

          <details className={styles.step} open={subcategories.length > 0 && !products.length}>
            <summary className={styles.stepSummary}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepCopy}><strong>أضف منتجًا</strong><span>حدد السعر والصورة ثم أضف خياراته</span></span>
              <span className={styles.stepCount}>{products.length.toLocaleString("ar")}</span>
            </summary>
            <div className={styles.stepBody}>
              {!subcategories.length ? (
                <div className="admin-empty"><strong>أضف باقة أولًا</strong><span>المنتج يجب أن يكون داخل باقة.</span></div>
              ) : (
                <form className={styles.form} action={saveCatalogProduct}>
                  <div className={styles.grid}>
                    <label className="field"><span className="field-label">الباقة</span><select className="admin-select" name="subcategoryId" required defaultValue=""><option value="" disabled>اختر الباقة</option>{subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}</select></label>
                    <label className="field"><span className="field-label">اسم المنتج</span><input name="name" required minLength={2} maxLength={120} placeholder="حساب RedotPay" /></label>
                    <label className="field"><span className="field-label">السعر الأساسي بالدولار (USD)</span><input name="basePriceUsd" type="number" min="0" step="0.0001" required inputMode="decimal" /></label>
                    <label className={styles.fileField}>
                      <span className={styles.fileLabel}>صورة المنتج</span>
                      <input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
                      <span className={styles.fileHint}>اختياري · حتى 5MB</span>
                    </label>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" name="suboptionsRequired" />
                    <span><strong>إجبار العميل على اختيار نوع</strong><small>مثال: حساب موثق فقط أو حساب موثق + فيزا. لكل نوع سعر مستقل.</small></span>
                  </label>
                  <input type="hidden" name="status" value="active" />
                  <input type="hidden" name="sortOrder" value={products.length} />
                  <details className={styles.advanced}>
                    <summary>تفاصيل إضافية</summary>
                    <div className={styles.advancedBody}>
                      <label className="field"><span className="field-label">وصف مختصر</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label>
                    </div>
                  </details>
                  <button className="btn btn-primary" type="submit"><PackagePlus aria-hidden="true" size={18} /> إضافة المنتج</button>
                </form>
              )}
            </div>
          </details>
        </section>

        <section className={styles.current}>
          <div className={styles.currentHead}>
            <h2>الكتالوج الحالي</h2>
            <Link className="btn btn-secondary" href="/admin/catalog/products">تعديل المنتجات</Link>
          </div>
          {!categories.length ? (
            <div className="admin-empty"><strong>الكتالوج فارغ</strong><span>ابدأ بإضافة القسم الأول أعلاه.</span></div>
          ) : (
            <div className={styles.tree}>
              {categories.map((category) => {
                const categorySubcategories = subcategories.filter((subcategory) => subcategory.category_id === category.id);
                return (
                  <article className={styles.treeItem} key={category.id}>
                    <div className={styles.treeTitle}>
                      <strong>{category.name}</strong>
                      <Link className={styles.treeLink} href="/admin/catalog/categories">تعديل</Link>
                    </div>
                    <div className={styles.treeChildren}>
                      {!categorySubcategories.length ? <span className="admin-muted">لا توجد باقات داخل هذا القسم</span> : categorySubcategories.map((subcategory) => {
                        const subcategoryProducts = products.filter((product) => product.subcategory_id === subcategory.id);
                        return (
                          <div key={subcategory.id}>
                            <div className={styles.treeRow}>
                              <span>{subcategory.name}</span>
                              <Link className={styles.treeLink} href="/admin/catalog/subcategories">تعديل</Link>
                            </div>
                            {subcategoryProducts.map((product) => (
                              <div className={styles.treeRow} key={product.id}>
                                <span>{product.name} · {Number(product.base_price_usd ?? 0).toLocaleString("ar", { maximumFractionDigits: 4 })} USD · {statusLabel(product.status)}</span>
                                <Link className={styles.treeLink} href={`/admin/catalog/products/${product.id}`}>الخيارات <ChevronLeft aria-hidden="true" size={14} /></Link>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="admin-muted" style={{ marginTop: 12 }}>
          سعر الصرف الحالي: 1 USD = {Number(settings?.usd_to_sdg_rate ?? 0).toLocaleString("ar")} {settings?.currency ?? "SDG"}
        </p>
      </div>
    </main>
  );
}
