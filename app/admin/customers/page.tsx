import { CircleCheck, UserRound, UsersRound } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminCustomersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: customers } = await admin
    .from("profiles")
    .select("id, display_name, phone, role, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CUSTOMERS</span>
            <h1>العملاء والحسابات</h1>
            <p>عرض منظم للحسابات الحالية وسيتم ربطه بالمحفظة وسجل الطلبات داخل المراحل المالية القادمة</p>
          </div>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div><h2>الحسابات</h2><p>{customers?.length ?? 0} حساب ظاهر في هذه الصفحة</p></div>
            <span className="admin-link-icon"><UsersRound aria-hidden="true" size={20} strokeWidth={2} /></span>
          </div>

          {!customers?.length ? (
            <div className="admin-empty"><strong>لا توجد حسابات</strong><span>ستظهر الحسابات الجديدة هنا بعد التسجيل</span></div>
          ) : (
            <div className="admin-data-list">
              {customers.map((customer) => (
                <article className="admin-list-row" key={customer.id}>
                  <div className="admin-list-main">
                    <span className="admin-task-icon"><UserRound aria-hidden="true" size={18} strokeWidth={2} /></span>
                    <span>
                      <strong>{customer.display_name || "عميل RAIZEY"}</strong>
                      <span dir="ltr">{customer.phone || `ID ${customer.id.slice(0, 8)}`}</span>
                    </span>
                  </div>
                  <span className={`admin-status${customer.is_active ? " is-success" : ""}`}>
                    {customer.is_active ? <><CircleCheck aria-hidden="true" size={12} strokeWidth={2} /> نشط</> : "متوقف"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
