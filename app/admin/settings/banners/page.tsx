import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ChevronDown, Images, Plus, Save, ScrollText } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { saveBanner } from "@/app/admin/settings/banners/actions";
import { saveTickerMessage } from "@/app/admin/settings/banners/ticker-actions";
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

function successMessage(message?: string) {
  if (message === "ticker_created") return "تمت إضافة رسالة الشريط المتحرك.";
  if (message === "ticker_updated") return "تم تحديث رسالة الشريط المتحرك.";
  if (message === "banner_updated") return "تم تحديث البنر بنجاح.";
  return "تم حفظ البنر بنجاح.";
}

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const typedAdmin = createAdminClient();
  const admin = typedAdmin as unknown as SupabaseClient;
  const [{ data: banners }, { data: tickerMessages }] = await Promise.all([
    typedAdmin
      .from("banners")
      .select("id, title, subtitle, image_url, mobile_image_url, link_url, button_text, status, sort_order, starts_at, ends_at")
      .order("sort_order")
      .order("created_at"),
    admin
      .from("ticker_messages")
      .select("id, message, status, sort_order, starts_at, ends_at, created_at")
      .order("sort_order")
      .order("created_at"),
  ]);

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div>
            <h1>واجهة المتجر والإعلانات</h1>
            <p>أدر البنرات المتحركة ورسائل الشريط الدائري من مكان واحد. توجد بنرات أساسية تلقائية في الواجهة حتى عندما لا تنشر إعلانًا خاصًا.</p>
          </div>
          <Link className="btn btn-secondary" href="/admin/settings">الإعدادات</Link>
        </div>

        {query.message && <div className="notice" role="status">{successMessage(query.message)}</div>}
        {query.error && (
          <div className="notice notice-error" role="alert">
            {query.error === "image_invalid"
              ? "تعذر رفع الصورة. استخدم JPG أو PNG أو WebP حتى 5MB."
              : query.error === "desktop_image_required"
                ? "اختر صورة البنر الأساسية من جهازك."
                : query.error.includes("ticker")
                  ? "تعذر حفظ رسالة الشريط. تحقق من النص والترتيب والجدولة."
                  : "تعذر حفظ البنر. تحقق من البيانات وحاول مرة أخرى."}
          </div>
        )}

        <div className="catalog-admin-layout">
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة بنر خاص</h2><p>استخدمه لتخفيض أو منتج جديد أو حملة محددة. البنرات الأساسية لا تحتاج منك أي إعداد.</p></div>
              <span className="admin-link-icon"><Plus aria-hidden="true" size={20} /></span>
            </div>
            <form className={styles.form} action={saveBanner}>
              <label className="field"><span className="field-label">العنوان الرئيسي</span><input name="title" required minLength={2} maxLength={120} placeholder="مثال: خصم على شحن PUBG هذا الأسبوع" /></label>
              <label className="field"><span className="field-label">وصف قصير</span><textarea className="admin-textarea" name="subtitle" maxLength={240} rows={2} placeholder="اكتب المعلومة التي يحتاجها العميل لفهم العرض بسرعة" /></label>
              <label className={styles.fileField}>
                <span className={styles.fileLabel}>صورة البنر</span>
                <input className={styles.fileInput} name="desktopImageFile" type="file" accept="image/jpeg,image/png,image/webp" required />
                <span className={styles.fileHint}>JPG أو PNG أو WebP · حتى 5MB. استخدم صورة بسيطة بدون نصوص كثيرة.</span>
              </label>
              <label className={styles.fileField}>
                <span className={styles.fileLabel}>صورة خاصة للموبايل</span>
                <input className={styles.fileInput} name="mobileImageFile" type="file" accept="image/jpeg,image/png,image/webp" />
                <span className={styles.fileHint}>اختياري. إذا لم تضفها ستُستخدم الصورة الأساسية.</span>
              </label>
              <div className={styles.grid}>
                <label className="field"><span className="field-label">نص الزر</span><input name="buttonText" maxLength={80} placeholder="شاهد العرض" /></label>
                <label className="field"><span className="field-label">وجهة الزر</span><input name="linkUrl" maxLength={1000} dir="ltr" placeholder="/catalog/pubg-mobile" /></label>
              </div>
              <input type="hidden" name="status" value="active" />
              <input type="hidden" name="sortOrder" value={banners?.length ?? 0} />
              <details className={styles.advanced}>
                <summary>جدولة وإعدادات إضافية</summary>
                <div className={styles.advancedBody}>
                  <div className={styles.grid}>
                    <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" /></label>
                    <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" /></label>
                  </div>
                </div>
              </details>
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة البنر</button>
            </form>
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>البنرات الخاصة الحالية</h2><p>{(banners?.length ?? 0).toLocaleString("ar")} بنر أضفته من الإدارة</p></div>
              <span className="admin-link-icon"><Images aria-hidden="true" size={20} /></span>
            </div>
            {!banners?.length ? (
              <div className="admin-empty"><strong>لا توجد بنرات خاصة</strong><span>الواجهة ستستخدم البنرات الأساسية التلقائية إلى أن تضيف إعلانًا.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {banners.map((banner) => (
                  <details className="catalog-edit-item" key={banner.id}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{banner.title}</strong><small>{banner.starts_at ? "مجدول" : "يظهر حسب الحالة"}</small></span>
                      <span className={`admin-status${banner.status === "active" ? " is-success" : banner.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(banner.status)}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveBanner}>
                      <input type="hidden" name="bannerId" value={banner.id} />
                      <input type="hidden" name="desktopExistingImageUrl" value={banner.image_url ?? ""} />
                      <input type="hidden" name="mobileExistingImageUrl" value={banner.mobile_image_url ?? ""} />
                      <label className="field"><span className="field-label">عنوان البنر</span><input name="title" required minLength={2} maxLength={120} defaultValue={banner.title} /></label>
                      <label className="field"><span className="field-label">وصف قصير</span><textarea className="admin-textarea" name="subtitle" maxLength={240} rows={2} defaultValue={banner.subtitle ?? ""} /></label>
                      <label className={styles.fileField}><span className={styles.fileLabel}>تغيير الصورة الأساسية</span><input className={styles.fileInput} name="desktopImageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>اتركه فارغًا للإبقاء على الصورة الحالية</span></label>
                      <label className={styles.fileField}><span className={styles.fileLabel}>تغيير صورة الموبايل</span><input className={styles.fileInput} name="mobileImageFile" type="file" accept="image/jpeg,image/png,image/webp" /><span className={styles.fileHint}>{banner.mobile_image_url ? "اتركه فارغًا للإبقاء عليها" : "اختياري"}</span></label>
                      <div className={styles.grid}>
                        <label className="field"><span className="field-label">نص الزر</span><input name="buttonText" maxLength={80} defaultValue={banner.button_text ?? ""} /></label>
                        <label className="field"><span className="field-label">وجهة الزر</span><input name="linkUrl" maxLength={1000} dir="ltr" defaultValue={banner.link_url ?? ""} /></label>
                      </div>
                      <details className={styles.advanced}>
                        <summary>جدولة وإعدادات إضافية</summary>
                        <div className={styles.advancedBody}>
                          <div className={styles.grid}>
                            <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" defaultValue={localDateTime(banner.starts_at)} /></label>
                            <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" defaultValue={localDateTime(banner.ends_at)} /></label>
                            <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={banner.sort_order} /></label>
                            <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={banner.status}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
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

        <div className="catalog-admin-layout" style={{ marginTop: 22 }}>
          <section className={`admin-form-card catalog-create-card ${styles.compactCard}`}>
            <div className="admin-panel-head">
              <div><h2>إضافة رسالة للشريط المتحرك</h2><p>جملة قصيرة واحدة مثل خبر أو تنبيه أو عرض. ستتحرك أسفل البنر بصورة دائرية.</p></div>
              <span className="admin-link-icon"><ScrollText aria-hidden="true" size={20} /></span>
            </div>
            <form className={styles.form} action={saveTickerMessage}>
              <label className="field"><span className="field-label">نص الرسالة</span><input name="message" required minLength={2} maxLength={180} placeholder="مثال: خصم خاص على بعض عروض PUBG حتى نهاية الأسبوع" /></label>
              <input type="hidden" name="status" value="active" />
              <input type="hidden" name="sortOrder" value={tickerMessages?.length ?? 0} />
              <details className={styles.advanced}>
                <summary>جدولة الرسالة</summary>
                <div className={styles.advancedBody}>
                  <div className={styles.grid}>
                    <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" /></label>
                    <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" /></label>
                  </div>
                </div>
              </details>
              <button className="btn btn-primary" type="submit"><Plus aria-hidden="true" size={18} /> إضافة الرسالة</button>
            </form>
          </section>

          <section className="admin-panel catalog-list-panel">
            <div className="admin-panel-head">
              <div><h2>رسائل الشريط</h2><p>{(tickerMessages?.length ?? 0).toLocaleString("ar")} رسالة إدارية</p></div>
              <span className="admin-link-icon"><ScrollText aria-hidden="true" size={20} /></span>
            </div>
            {!tickerMessages?.length ? (
              <div className="admin-empty"><strong>لا توجد رسائل مخصصة</strong><span>سيعرض المتجر رسائل RAIZEY الأساسية تلقائيًا.</span></div>
            ) : (
              <div className="catalog-edit-list">
                {tickerMessages.map((ticker) => (
                  <details className="catalog-edit-item" key={String(ticker.id)}>
                    <summary>
                      <span className="catalog-edit-main"><strong>{String(ticker.message)}</strong><small>{ticker.starts_at ? "مجدولة" : "تظهر حسب الحالة"}</small></span>
                      <span className={`admin-status${ticker.status === "active" ? " is-success" : ticker.status === "inactive" ? " is-warning" : ""}`}>{statusLabel(String(ticker.status))}</span>
                      <ChevronDown aria-hidden="true" size={18} />
                    </summary>
                    <form className={`${styles.editForm} catalog-edit-form`} action={saveTickerMessage}>
                      <input type="hidden" name="tickerId" value={String(ticker.id)} />
                      <label className="field"><span className="field-label">نص الرسالة</span><input name="message" required minLength={2} maxLength={180} defaultValue={String(ticker.message)} /></label>
                      <div className={styles.grid}>
                        <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" defaultValue={Number(ticker.sort_order ?? 0)} /></label>
                        <label className="field"><span className="field-label">الحالة</span><select className="admin-select" name="status" defaultValue={String(ticker.status)}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                        <label className="field"><span className="field-label">يبدأ في</span><input name="startsAt" type="datetime-local" defaultValue={localDateTime(ticker.starts_at ? String(ticker.starts_at) : null)} /></label>
                        <label className="field"><span className="field-label">ينتهي في</span><input name="endsAt" type="datetime-local" defaultValue={localDateTime(ticker.ends_at ? String(ticker.ends_at) : null)} /></label>
                      </div>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} /> حفظ الرسالة</button>
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
