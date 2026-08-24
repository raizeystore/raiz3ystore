import Link from "next/link";
import { CircleDollarSign, Clock3, Landmark, WalletCards } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminFinancePage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [paymentsRes, reviewRes, methodsRes] = await Promise.all([
    admin.from("payments").select("*", { count: "exact", head: true }),
    admin.from("payments").select("*", { count: "exact", head: true }).eq("status", "under_review"),
    admin.from("payment_methods").select("id, name, status, account_identifier, code").order("sort_order").order("name"),
  ]);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">FINANCE</span>
            <h1>المالية</h1>
            <p>نظرة تشغيلية على المدفوعات الحالية مع تجهيز هذا القسم لاحقًا للمحفظة وشحن الرصيد ورموز الدفع</p>
          </div>
        </div>

        <section className="admin-metrics">
          <article className="admin-metric-card"><div className="admin-metric-top"><span>كل المدفوعات</span><span className="admin-metric-icon"><CircleDollarSign aria-hidden="true" size={19} strokeWidth={2} /></span></div><strong>{(paymentsRes.count ?? 0).toLocaleString("ar")}</strong></article>
          <article className="admin-metric-card"><div className="admin-metric-top"><span>تحت المراجعة</span><span className="admin-metric-icon"><Clock3 aria-hidden="true" size={19} strokeWidth={2} /></span></div><strong>{(reviewRes.count ?? 0).toLocaleString("ar")}</strong></article>
          <article className="admin-metric-card"><div className="admin-metric-top"><span>طرق الدفع</span><span className="admin-metric-icon"><Landmark aria-hidden="true" size={19} strokeWidth={2} /></span></div><strong>{(methodsRes.data?.length ?? 0).toLocaleString("ar")}</strong></article>
          <article className="admin-metric-card"><div className="admin-metric-top"><span>المحفظة</span><span className="admin-metric-icon"><WalletCards aria-hidden="true" size={19} strokeWidth={2} /></span></div><strong>—</strong></article>
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><h2>وسائل الدفع الحالية</h2><p>البيانات الحالية قبل توسيع النظام المالي</p></div></div>
            {!methodsRes.data?.length ? <div className="admin-empty"><strong>لا توجد وسائل دفع</strong><span>أضف وسيلة دفع من الإعدادات</span></div> : (
              <div className="admin-data-list">
                {methodsRes.data.map((method) => (
                  <div className="admin-list-row" key={method.id}>
                    <div className="admin-list-main"><span className="admin-task-icon"><Landmark aria-hidden="true" size={18} strokeWidth={2} /></span><span><strong>{method.name}</strong><span dir="ltr">{method.account_identifier || method.code}</span></span></div>
                    <span className={`admin-status${method.status === "active" ? " is-success" : ""}`}>{method.status === "active" ? "نشط" : "متوقف"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><div><h2>إجراءات سريعة</h2><p>الانتقال للمكان الصحيح بدل تكديس النماذج هنا</p></div></div>
            <div className="admin-quick-grid">
              <Link className="admin-link-card" href="/admin/orders"><span className="admin-link-icon"><Clock3 aria-hidden="true" size={19} strokeWidth={2} /></span><strong>مراجعة الدفعات</strong><span>القبول والرفض من صفحة الطلبات</span></Link>
              <Link className="admin-link-card" href="/admin/settings"><span className="admin-link-icon"><Landmark aria-hidden="true" size={19} strokeWidth={2} /></span><strong>وسائل الدفع</strong><span>إضافة وسيلة أو مراجعة الإعدادات</span></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
