import { Boxes, ChevronDown, Plus, Save } from "lucide-react";
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
  if (message === "subcategory_created") return "تمت إضافة الباقة وربطها بالقسم";
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
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CATALOG / SUBCATEGORIES</span>
            <h1>الباقات والتصنيفات</h1>
            <p>كل باقة مرتبطة بقسم واحد فقط، ومنها يصل العميل إلى المنتجات.</p>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ الباقة. تحقق من القسم والقيم وعدم تكرار الرابط.</div>}

        <div className="catalog-admin-layout">
          <section className="admin-form-card catalog-create-card">
            <div className="admin-panel-head">
              <div><h2>إضافة باقة</h2><p>مثل PUBG Mobile داخل قسم الألعاب</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            {!categories?.length ? (
              <div className="admin-empty"><strong>أضف قسمًا أولًا</strong><span>لا يمكن إنشاء باقة بدون قسم أب.</span></div>
            ) : (
              <form className="auth-form" action={saveSubcategory}>
                <div className="admin-form-grid">
                  <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue=""><option value="" disabled>اختر القسم</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}{category.status !== "active" ? " — غير نشط" : ""}</option>)}</select></label>
                  <label className="field"><span className="field-label">اسم الباقة</span><input name="name" required minLength={2} maxLength={120} /></label>
                  <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" placeholder="pubg-mobile" /></label>
                  <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" placeholder="https://" /></label>
                  <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" inputMode="numeric" /></label>
                  <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue="active"><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                </div>
                <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} /></label>
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
              <div className="admin-empty"><strong>لا توجد باقات حتى الآن</strong><span>أضف أول باقة بعد إنشاء القسم.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {subcategories.map((subcategory) => (
                  <details className="catalog-edit-item" key={subcategory.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{subcategory.name}</strong><small>{categoryNames.get(subcategory.category_id) ?? "قسم غير معروف"} · /{subcategory.slug}</small></span>
                      <span className={`admin-status${subcategory.status === "active" ? " is-success" : subcategory.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(subcategory.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className="auth-form catalog-edit-form" action={saveSubcategory}>
                      <input type="hidden" name="subcategoryId" value={subcategory.id} />
                      <div className="admin-form-grid">
                        <label className="field"><span className="field-label">القسم</span><select className="admin-select" name="categoryId" required defaultValue={subcategory.category_id}>{(categories ?? []).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                        <label className="field"><span className="field-label">اسم الباقة</span><input name="name" required minLength={2} maxLength={120} defaultValue={subcategory.name} /></label>
                        <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={subcategory.slug} /></label>
                        <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" defaultValue={subcategory.image_url ?? ""} /></label>
                        <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={subcategory.sort_order} inputMode="numeric" /></label>
                        <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={subcategory.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      </div>
                      <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} defaultValue={subcategory.description ?? ""} /></label>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الباقة</button>
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
