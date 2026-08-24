import Link from "next/link";
import { Gamepad2, PackagePlus } from "lucide-react";
import { createGame, createProduct } from "@/app/admin/actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

export default async function AdminCatalogCreatePage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: games } = await admin.from("games").select("id, name, status").order("sort_order").order("name");

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CURRENT CATALOG</span>
            <h1>إضافة عنصر</h1>
            <p>هذه أدوات إنشاء الكتالوج الحالي فقط وسيتم استبدالها بهيكل الأقسام ثم التصنيفات ثم المنتجات في Catalog V2</p>
          </div>
          <Link className="btn btn-secondary" href="/admin/catalog">إدارة العناصر الحالية</Link>
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-form-card" style={{ maxWidth: "none", margin: 0 }}>
            <div className="admin-panel-head"><div><h2>إضافة لعبة</h2><p>المستوى الحالي قبل ترحيل الكتالوج الثلاثي</p></div><span className="admin-link-icon"><Gamepad2 aria-hidden="true" size={20} strokeWidth={2} /></span></div>
            <form className="auth-form" action={createGame}>
              <label className="field"><span className="field-label">اسم اللعبة</span><input name="name" required maxLength={120} /></label>
              <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label>
              <label className="field"><span className="field-label">الوصف</span><textarea name="description" rows={4} maxLength={1000} style={controlStyle} /></label>
              <button className="btn btn-primary" type="submit">إضافة اللعبة</button>
            </form>
          </section>

          <section className="admin-form-card" style={{ maxWidth: "none", margin: 0 }}>
            <div className="admin-panel-head"><div><h2>إضافة منتج</h2><p>إضافة عرض مرتبط بلعبة في البنية الحالية</p></div><span className="admin-link-icon"><PackagePlus aria-hidden="true" size={20} strokeWidth={2} /></span></div>
            {!games?.length ? (
              <div className="admin-empty"><strong>أضف لعبة أولًا</strong><span>لا يمكن إنشاء منتج في النظام الحالي بدون لعبة مرتبطة</span></div>
            ) : (
              <form className="auth-form" action={createProduct}>
                <label className="field"><span className="field-label">اللعبة</span><select name="gameId" required defaultValue="" style={controlStyle}><option value="" disabled>اختر اللعبة</option>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></label>
                <label className="field"><span className="field-label">اسم العرض</span><input name="name" required maxLength={120} /></label>
                <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label>
                <label className="field"><span className="field-label">SKU اختياري</span><input name="sku" maxLength={80} dir="ltr" /></label>
                <div className="admin-form-grid"><label className="field"><span className="field-label">السعر</span><input name="price" type="number" min="0" step="0.01" required inputMode="decimal" /></label><label className="field"><span className="field-label">العملة</span><input name="currency" defaultValue="SDG" maxLength={5} required dir="ltr" /></label></div>
                <label className="field"><span className="field-label">الوصف</span><textarea name="description" rows={4} maxLength={1000} style={controlStyle} /></label>
                <button className="btn btn-primary" type="submit">إضافة المنتج</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
