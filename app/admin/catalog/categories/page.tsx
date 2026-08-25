import { ChevronDown, Layers3, Plus, Save } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveCategory } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "category_created") return "تمت إضافة القسم";
  if (message === "category_updated") return "تم تحديث القسم";
  return null;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();
  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug, description, image_url, status, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const success = notice(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div><h1>الأقسام</h1><p>مثل الألعاب أو الاشتراكات. الاسم والصورة هما المهمان، والباقي اختياري.</p></div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">{query.error === "image_invalid" ? "الصورة غير صالحة. استخدم JPG أو PNG أو WebP حتى 5MB." : "تعذر حفظ القسم. تحقق من الاسم وحاول مرة أخرى."}</div>}

        <div className="catalog-admin-layout">
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة قسم</h2><p>مثال: الألعاب</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            <form className={styles.form} action={saveCategory}>
              <label className="field"><span className="field-label">اسم القسم</span><input name="name" required minLength={2} maxLength={120} /></label>
              <label className={styles.fileField}><span className={styles.fileLabel}>صورة القسم</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>اختياري · حتى 5MB</span></label>
              <input type="hidden" name="status" value="active" />
              <input type="hidden" name="sortOrder" value={categories?.length ?? 0} />
              <details className={styles.advanced}>
                <summary>تفاصيل إضافية</summary>
                <div className={styles.advancedBody}>
                  <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label>
                </div>
              </details>
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة القسم</button>
            </form>
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>الأقسام الحالية</h2><p>{(categories?.length ?? 0).toLocaleString("ar")} قسم</p></div>
              <span className="admin-link-icon"><Layers3 aria-hidden="true" size={20} /></span>
            </div>

            {!categories?.length ? (
              <div className="admin-empty"><strong>لا توجد أقسام</strong><span>أضف القسم الأول من النموذج.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {categories.map((category) => (
                  <details className="catalog-edit-item" key={category.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{category.name}</strong><small>{statusLabel(category.status)}</small></span>
                      <span className={`admin-status${category.status === "active" ? " is-success" : category.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(category.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="slug" value={category.slug} />
                      <input type="hidden" name="existingImageUrl" value={category.image_url ?? ""} />
                      <label className="field"><span className="field-label">اسم القسم</span><input name="name" required minLength={2} maxLength={120} defaultValue={category.name} /></label>
                      <label className={styles.fileField}><span className={styles.fileLabel}>تغيير الصورة</span><input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>{category.image_url ? "اتركه فارغًا للإبقاء على الصورة الحالية" : "لا توجد صورة حاليًا"}</span></label>
                      <details className={styles.advanced}>
                        <summary>تفاصيل إضافية</summary>
                        <div className={styles.advancedBody}>
                          <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} defaultValue={category.description ?? ""} /></label>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={category.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={category.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
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
