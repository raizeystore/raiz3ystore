import Link from "next/link";
import { ChevronDown, Images, Plus, Save } from "lucide-react";
import { saveBanner } from "@/app/admin/settings/banners/actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();
  const { data: banners } = await admin
    .from("banners")
    .select("id, title, subtitle, image_url, mobile_image_url, link_url, button_text, status, sort_order, starts_at, ends_at")
    .order("sort_order")
    .order("created_at");

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">SETTINGS / BANNERS</span>
            <h1>بنرات الواجهة</h1>
            <p>حتى 6 بنرات مرتبة، بصور منفصلة للموبايل وسجل تدقيق لكل تعديل.</p>
          </div>
          <Link className="btn btn-secondary" href="/admin/settings">الإعدادات</Link>
        </div>

        {query.message && <div className="notice" role="status">تم حفظ البنر بنجاح</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر حفظ البنر. تحقق من الروابط والفترة الزمنية.</div>}

        <div className="catalog-admin-layout">
          <section className="admin-form-card catalog-create-card">
            <div className="admin-panel-head">
              <div><h2>إضافة بنر</h2><p>البنر الأول فقط يُحمّل بأولوية، والبقية Lazy-loaded.</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            <form className="auth-form" action={saveBanner}>
              <label className="field"><span className="field-label">العنوان</span><input name="title" required minLength={2} maxLength={120} /></label>
              <label className="field"><span className="field-label">النص المساعد</span><textarea className="admin-textarea" name="subtitle" maxLength={240} rows={3} /></label>
              <div className="admin-form-grid">
                <label className="field"><span className="field-label">صورة Desktop</span><input name="desktopImage" type="url" maxLength={1000} dir="ltr" placeholder="https://" /></label>
                <label className="field"><span className="field-label">صورة Mobile</span><input name="mobileImage" type="url" maxLength={1000} dir="ltr" placeholder="https://" /></label>
                <label className="field"><span className="field-label">رابط الزر</span><input name="linkUrl" maxLength={1000} dir="ltr" placeholder="/catalog/pubg-mobile" /></label>
                <label className="field"><span className="field-label">نص الزر</span><input name="buttonText" maxLength={80} placeholder="اكتشف العرض" /></label>
                <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" /></label>
                <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" /></label>
                <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue="0" /></label>
                <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue="active"><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
              </div>
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة البنر</button>
            </form>
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>البنرات الحالية</h2><p>{(banners?.length ?? 0).toLocaleString("ar")} من 6 موصى بها</p></div>
              <span className="admin-link-icon"><Images aria-hidden="true" size={20} /></span>
            </div>
            {!banners?.length ? (
              <div className="admin-empty"><strong>لا توجد بنرات</strong><span>ستظهر واجهة Hero الاحتياطية الرسمية حتى إضافة أول بنر.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {banners.map((banner) => (
                  <details className="catalog-edit-item" key={banner.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{banner.title}</strong><small>ترتيب {banner.sort_order.toLocaleString("ar")}{banner.starts_at ? " · مجدول" : ""}</small></span>
                      <span className={`admin-status${banner.status === "active" ? " is-success" : banner.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(banner.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className="auth-form catalog-edit-form" action={saveBanner}>
                      <input type="hidden" name="bannerId" value={banner.id} />
                      <label className="field"><span className="field-label">العنوان</span><input name="title" required minLength={2} maxLength={120} defaultValue={banner.title} /></label>
                      <label className="field"><span className="field-label">النص المساعد</span><textarea className="admin-textarea" name="subtitle" maxLength={240} rows={3} defaultValue={banner.subtitle ?? ""} /></label>
                      <div className="admin-form-grid">
                        <label className="field"><span className="field-label">صورة Desktop</span><input name="desktopImage" type="url" maxLength={1000} dir="ltr" defaultValue={banner.image_url ?? ""} /></label>
                        <label className="field"><span className="field-label">صورة Mobile</span><input name="mobileImage" type="url" maxLength={1000} dir="ltr" defaultValue={banner.mobile_image_url ?? ""} /></label>
                        <label className="field"><span className="field-label">رابط الزر</span><input name="linkUrl" maxLength={1000} dir="ltr" defaultValue={banner.link_url ?? ""} /></label>
                        <label className="field"><span className="field-label">نص الزر</span><input name="buttonText" maxLength={80} defaultValue={banner.button_text ?? ""} /></label>
                        <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" defaultValue={localDateTime(banner.starts_at)} /></label>
                        <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" defaultValue={localDateTime(banner.ends_at)} /></label>
                        <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={banner.sort_order} /></label>
                        <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={banner.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      </div>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ البنر</button>
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
