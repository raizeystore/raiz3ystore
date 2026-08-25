import Image from "next/image";
import { Boxes, ChevronDown, Plus, Save } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { saveSubcategory } from "@/app/admin/catalog/v2-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function statusLabel(status: string) {
  if (status === "active") return "مفعل";
  if (status === "inactive") return "موقوف";
  return "مؤرشف";
}

function notice(message?: string) {
  if (message === "subcategory_created") return "تمت إضافة التصنيف بنجاح";
  if (message === "subcategory_updated") return "تم تحديث التصنيف";
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
          <div>
            <h1>التصنيفات / الباقات</h1>
            <p>كل تصنيف يتبع قسمًا واحدًا وله صورة تظهر للعميل في واجهة المتجر.</p>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && (
          <div className="notice notice-error" role="alert">
            {query.error === "image_invalid"
              ? "تعذر رفع الصورة. استخدم JPG أو PNG أو WebP حتى 5MB."
              : "تعذر حفظ التصنيف. تحقق من القسم والاسم والصورة."}
          </div>
        )}

        <div className="catalog-admin-layout">
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة تصنيف</h2><p>مثال: PUBG Mobile داخل قسم الألعاب</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            {!categories?.length ? (
              <div className="admin-empty"><strong>أضف قسمًا أولًا</strong><span>لا يمكن إضافة تصنيف قبل وجود قسم.</span></div>
            ) : (
              <form className={styles.form} action={saveSubcategory}>
                <label className="field">
                  <span className="field-label">القسم</span>
                  <select className="admin-select" name="categoryId" required defaultValue="">
                    <option value="" disabled>اختر القسم</option>
                    {categories.map((category) => <option value={category.id} key={category.id}>{category.name}{category.status !== "active" ? " — موقوف" : ""}</option>)}
                  </select>
                </label>
                <label className="field"><span className="field-label">اسم التصنيف</span><input name="name" required minLength={2} maxLength={120} placeholder="PUBG Mobile" /></label>
                <label className={styles.fileField}>
                  <span className={styles.fileLabel}>صورة التصنيف</span>
                  <input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" required />
                  <span className={styles.fileHint}>مطلوبة · JPG أو PNG أو WebP · حتى 5MB</span>
                </label>
                <label className="field">
                  <span className="field-label">الحالة</span>
                  <select className="admin-select" name="status" defaultValue="active"><option value="active">مفعل</option><option value="inactive">موقوف</option></select>
                </label>
                <input type="hidden" name="sortOrder" value={subcategories?.length ?? 0} />
                <details className={styles.advanced}>
                  <summary>وصف اختياري</summary>
                  <div className={styles.advancedBody}><label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} /></label></div>
                </details>
                <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة التصنيف</button>
              </form>
            )}
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>التصنيفات الحالية</h2><p>{(subcategories?.length ?? 0).toLocaleString("ar")} تصنيف</p></div>
              <span className="admin-link-icon"><Boxes aria-hidden="true" size={20} /></span>
            </div>
            {!subcategories?.length ? (
              <div className="admin-empty"><strong>لا توجد تصنيفات</strong><span>أضف أول تصنيف بعد إنشاء القسم.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {subcategories.map((subcategory) => (
                  <details className="catalog-edit-item" key={subcategory.id}>
                    <summary>
                      {subcategory.image_url ? (
                        <Image src={subcategory.image_url} alt="" width={52} height={52} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 12 }} />
                      ) : (
                        <span className="admin-link-icon"><Boxes aria-hidden="true" size={20} /></span>
                      )}
                      <span className="catalog-edit-main"><strong>{subcategory.name}</strong><small>{categoryNames.get(subcategory.category_id) ?? "قسم غير معروف"}</small></span>
                      <span className={`admin-status${subcategory.status === "active" ? " is-success" : " is-warning"}`}>{statusLabel(subcategory.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveSubcategory}>
                      <input type="hidden" name="subcategoryId" value={subcategory.id} />
                      <input type="hidden" name="slug" value={subcategory.slug} />
                      <input type="hidden" name="existingImageUrl" value={subcategory.image_url ?? ""} />
                      <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue={subcategory.category_id}>{(categories ?? []).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                      <label className="field"><span className="field-label">اسم التصنيف</span><input name="name" required minLength={2} maxLength={120} defaultValue={subcategory.name} /></label>
                      <label className={styles.fileField}>
                        <span className={styles.fileLabel}>تغيير الصورة</span>
                        <input className={styles.fileInput} name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" />
                        <span className={styles.fileHint}>{subcategory.image_url ? "الصورة الحالية محفوظة — اختر ملفًا فقط إذا أردت تغييرها" : "لا توجد صورة — ارفع صورة لهذا التصنيف"}</span>
                      </label>
                      <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={subcategory.status === "archived" ? "inactive" : subcategory.status}><option value="active">مفعل</option><option value="inactive">موقوف</option></select></label>
                      <details className={styles.advanced}>
                        <summary>تفاصيل إضافية</summary>
                        <div className={styles.advancedBody}>
                          <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={3} defaultValue={subcategory.description ?? ""} /></label>
                          <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={subcategory.sort_order} /></label>
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
