import { Activity, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminAuditPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">AUDIT LOG</span>
            <h1>سجل التدقيق</h1>
            <p>آخر العمليات المسجلة في قاعدة البيانات لمراجعة التغييرات الإدارية والمالية الحساسة</p>
          </div>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>آخر الأحداث</h2><p>يتم العرض من الأحدث إلى الأقدم</p></div><span className="admin-link-icon"><Activity aria-hidden="true" size={20} strokeWidth={2} /></span></div>
          {!logs?.length ? (
            <div className="admin-empty"><strong>لا توجد أحداث مسجلة</strong><span>ستظهر العمليات الحساسة هنا عند حدوثها</span></div>
          ) : (
            <div className="admin-data-list">
              {logs.map((log) => (
                <article className="admin-list-row" key={String(log.id)}>
                  <div className="admin-list-main">
                    <span className="admin-task-icon"><ShieldCheck aria-hidden="true" size={18} strokeWidth={2} /></span>
                    <span>
                      <strong>{log.action}</strong>
                      <span>{log.entity_type}{log.entity_id ? ` · ${String(log.entity_id).slice(0, 8)}` : ""} · {new Intl.DateTimeFormat("ar-SD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(log.created_at))}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
