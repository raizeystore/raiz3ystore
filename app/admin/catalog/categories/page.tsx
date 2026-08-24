import { ChevronDown, Layers3, Plus, Save } from "lucide-react";
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
    .select("id, name, slug, description, image_url, status, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  const success = notice(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CATALOG / CATEGORIES</span>
            <h1>الأقسام الرئيسية</h1>
            <p>القسم عنوان وحاوية بصرية فقط، ولا تُربط المنتجات به مباشرة.</p>
          </div>
        </div>
        <CatalogNav />

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ القسم. تحقق من الاسم والرابط وعدم تكرارهما.</div>}

        <div className="catalog-admin-layout">
          <section className="admin-form-card catalog-create-card">
            <div className="admin-panel-head">
              <div><h2>إضافة قسم</h2><p>مثل الألعاب أو الاشتراكات أو الشحن المباشر</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            <form className="auth-form" action={saveCategory}>
              <div className="admin-form-grid">
                <label className="field"><span className="field-label">اسم القسم</span><input name="name" required minLength={2} maxLength={120} /></label>
                <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" placeholder="games" /></label>
                <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" placeholder="https://" /></label>
                <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" inputMode="numeric" /></label>
                <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue="active"><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
              </div>
              <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} /></label>
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة القسم</button>
            </form>
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>الأقسام الحالية</h2><p>{(categories?.length ?? 0).toLocaleString("ar")} قسم</p></div>
              <span className="admin-link-icon"><Layers3 aria-hidden="true" size={20} /></span>
            </div>

            {!categories?.length ? (
              <div className="admin-empty"><strong>لا توجد أقسام حتى الآن</strong><span>أضف أول قسم من النموذج المجاور.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {categories.map((category) => (
                  <details className="catalog-edit-item" key={category.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{category.name}</strong><small>/{category.slug} · ترتيب {category.sort_order.toLocaleString("ar")}</small></span>
                      <span className={`admin-status${category.status === "active" ? " is-success" : category.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(category.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className="auth-form catalog-edit-form" action={saveCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <div className="admin-form-grid">
                        <label className="field"><span className="field-label">اسم القسم</span><input name="name" required minLength={2} maxLength={120} defaultValue={category.name} /></label>
                        <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={category.slug} /></label>
                        <label className="field"><span className="field-label">رابط الصورة</span><input name="imageUrl" type="url" maxLength={1000} dir="ltr" defaultValue={category.image_url ?? ""} /></label>
                        <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={category.sort_order} inputMode="numeric" /></label>
                        <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={category.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      </div>
                      <label className="field"><span className="field-label">الوصف</span><textarea className="admin-textarea" name="description" maxLength={1200} rows={4} defaultValue={category.description ?? ""} /></label>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ القسم</button>
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
