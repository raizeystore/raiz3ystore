import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminStaffPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: admins } = await admin
    .from("profiles")
    .select("id, display_name, phone, role, is_active, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">STAFF & ACCESS</span>
            <h1>المشرفون والصلاحيات</h1>
            <p>عرض المشرفين الحاليين مع إبقاء نظام الأدوار الدقيقة لمرحلة مستقلة حتى لا نوسع الصلاحيات قبل بناء قيودها في قاعدة البيانات</p>
          </div>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>المشرفون الحاليون</h2><p>الحسابات التي تحمل دور admin في النظام الحالي</p></div><span className="admin-link-icon"><ShieldCheck aria-hidden="true" size={20} strokeWidth={2} /></span></div>
          {!admins?.length ? (
            <div className="admin-empty"><strong>لا يوجد مشرفون</strong><span>يجب أن يبقى الوصول الإداري محميًا على مستوى الخادم وقاعدة البيانات</span></div>
          ) : (
            <div className="admin-data-list">
              {admins.map((member) => (
                <div className="admin-list-row" key={member.id}>
                  <div className="admin-list-main"><span className="admin-task-icon"><UserCog aria-hidden="true" size={18} strokeWidth={2} /></span><span><strong>{member.display_name || "RAIZEY Admin"}</strong><span dir="ltr">{member.phone || `ID ${member.id.slice(0, 8)}`}</span></span></div>
                  <span className={`admin-status${member.is_active ? " is-success" : ""}`}>{member.is_active ? "نشط" : "متوقف"}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head"><div><h2>الأدوار الدقيقة</h2><p>Owner وOrders Manager وFinance وCatalog Manager ستُنفذ بصلاحيات قاعدة بيانات حقيقية وليس بإخفاء الأزرار فقط</p></div><span className="admin-link-icon"><KeyRound aria-hidden="true" size={20} strokeWidth={2} /></span></div>
          <div className="admin-empty"><strong>لن نفعّل صلاحيات جزئية قبل migration الأدوار</strong><span>هذه الخطوة ستأتي بعد Catalog V2 وطبقة المالية حتى تكون أسماء الصلاحيات ثابتة وقابلة للاختبار</span></div>
        </section>
      </div>
    </main>
  );
}
