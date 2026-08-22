import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
import { progressOrder } from "@/app/admin/order-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const STATUS_LABELS: Record<string, string> = {
  paid: "جاهز للتنفيذ",
  processing: "قيد التنفيذ",
  completed: "مكتمل",
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, user_id, status, total, currency, admin_note, created_at")
    .in("status", ["paid", "processing"])
    .order("created_at", { ascending: true })
    .limit(100);

  const orderIds = (orders ?? []).map((order) => order.id);
  const { data: items } = orderIds.length
    ? await admin
        .from("order_items")
        .select("order_id, product_name, player_id, player_name")
        .in("order_id", orderIds)
    : { data: [] };

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="تنقل الإدارة">
            <Link href="/admin">لوحة الإدارة</Link>
            <Link href="/admin/orders">تنفيذ الطلبات</Link>
            <Link href="/games">واجهة المتجر</Link>
            <Link href="/account">حسابي</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />FULFILLMENT</span>
              <h1>تنفيذ الطلبات</h1>
              <p>هنا تظهر الطلبات التي تم تأكيد دفعها. الانتقال المسموح فقط: مدفوع ← قيد التنفيذ ← مكتمل.</p>
            </div>
            <Link className="btn btn-secondary" href="/admin">العودة للإدارة</Link>
          </div>

          {!orders?.length ? (
            <div className="cta-band"><div><h2>ما في طلبات تنتظر التنفيذ</h2><p>بعد قبول إيصال دفع، الطلب يظهر هنا تلقائيًا.</p></div></div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {orders.map((order) => {
                const item = items?.find((row) => row.order_id === order.id);
                const nextStatus = order.status === "paid" ? "processing" : "completed";
                return (
                  <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={order.id}>
                    <div className="auth-card-header">
                      <span className="card-kicker">{STATUS_LABELS[order.status] ?? order.status}</span>
                      <h2>{order.order_number}</h2>
                      <p>{item?.product_name ?? "طلب RAIZEY"} • {new Intl.NumberFormat("ar-SD").format(order.total)} {order.currency}</p>
                    </div>

                    <div className="info-grid" style={{ marginBottom: 18 }}>
                      <div className="info-card"><h3>Player ID</h3><p style={{ color: "var(--text)" }}>{item?.player_id ?? "—"}</p></div>
                      <div className="info-card"><h3>اسم اللاعب</h3><p>{item?.player_name ?? "—"}</p></div>
                      <div className="info-card"><h3>الحالة</h3><p>{STATUS_LABELS[order.status] ?? order.status}</p></div>
                    </div>

                    <form className="auth-form" action={progressOrder}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="nextStatus" value={nextStatus} />
                      <label className="field">
                        <span className="field-label">ملاحظة التنفيذ (اختياري)</span>
                        <input name="note" maxLength={500} placeholder="مثلاً: تم الشحن ومراجعة Player ID" />
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <button className="btn btn-primary" type="submit">{nextStatus === "processing" ? "بدء التنفيذ" : "تحديد كمكتمل"}</button>
                        <Link className="btn btn-secondary" href={`/orders/${order.order_number}`}>عرض تفاصيل الطلب</Link>
                      </div>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
