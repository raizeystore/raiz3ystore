import { Boxes, ChevronDown, Plus, Save } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveSubcategory } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "subcategory_created") return "تمت إضافة الباقة";
  if (message === "subcategory_updated") return "تم تحديث الباقة";
  return null;
}

export default async function AdminSubcategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    admin.from("categories").select("id, name, status, sort_order").order("sort_order").order("name"),
    admin
      .from("subcategories")
      .select("id, category_id, name, slug, description, image_url, status, sort_order")
      .order("sort_order")
      .order("name"),
  ]);
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const success = notice(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div><h1>الباقات</h1><p>اختر القسم ثم اكتب اسم الباقة وارفع صورتها.</p></div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">{query.error === "image_invalid" ? "الصورة غير صالحة. استخدم JPG أو PNG أو WebP حتى 5MB." : "تعذر حفظ الباقة. تحقق من القسم والاسم."}</div>}

        <div className="catalog-admin-layout">
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة باقة</h2><p>مثال: PUBG Mobile</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            {!categories?.length ? (
              <div className="admin-empty"><strong>أضف قسمًا أولًا</strong><span>لا يمكن إضافة باقة قبل وجود قسم.</span></div>
            ) : (
              <form className={styles.form} action={saveSubcategory}>
                <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue=""><option value="" disabled>اختر القسم</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                <label className="field"><span className="field-label">اسم الباقة</span><input name="name" required minLength={2} maxLength={120} /></label>
                <label className={styles.fileField}><span className={styles.fileLabel}>صورة الباقة</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>اختياري · حتى 5MB</span></label>
                <input type="hidden" name="status" value="active" />
                <input type="hidden" name="sortOrder" value={subcategories?.length ?? 0} />
                <details className={styles.advanced}>
                  <summary>تفاصيل إضافية</summary>
                  <div className={styles.advancedBody}><label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label></div>
                </details>
                <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الباقة</button>
              </form>
            )}
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>الباقات الحالية</h2><p>{(subcategories?.length ?? 0).toLocaleString("ar")} باقة</p></div>
              <span className="admin-link-icon"><Boxes aria-hidden="true" size={20} /></span>
            </div>
            {!subcategories?.length ? (
              <div className="admin-empty"><strong>لا توجد باقات</strong><span>أضف أول باقة بعد إنشاء القسم.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {subcategories.map((subcategory) => (
                  <details className="catalog-edit-item" key={subcategory.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{subcategory.name}</strong><small>{categoryNames.get(subcategory.category_id) ?? "قسم غير معروف"}</small></span>
                      <span className={`admin-status${subcategory.status === "active" ? " is-success" : subcategory.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(subcategory.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveSubcategory}>
                      <input type="hidden" name="subcategoryId" value={subcategory.id} />
                      <input type="hidden" name="slug" value={subcategory.slug} />
                      <input type="hidden" name="existingImageUrl" value={subcategory.image_url ?? ""} />
                      <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue={subcategory.category_id}>{(categories ?? []).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                      <label className="field"><span className="field-label">اسم الباقة</span><input name="name" required minLength={2} maxLength={120} defaultValue={subcategory.name} /></label>
                      <label className={styles.fileField}><span className={styles.fileLabel}>تغيير الصورة</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>{subcategory.image_url ? "اتركه فارغًا للإبقاء على الصورة الحالية" : "لا توجد صورة حاليًا"}</span></label>
                      <details className={styles.advanced}>
                        <summary>تفاصيل إضافية</summary>
                        <div className={styles.advancedBody}>
                          <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} defaultValue={subcategory.description ?? ""} /></label>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={subcategory.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={subcategory.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
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
        </div>
      </div>
    </main>
  );
}
