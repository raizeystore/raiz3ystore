import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck, ReceiptText, TriangleAlert } from "lucide-react";
import { reviewPayment } from "@/app/admin/actions";
import { progressOrder } from "@/app/admin/order-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

const STATUS_LABELS: Record<string, string> = {
  paid: "جاهز للتنفيذ",
  processing: "قيد التنفيذ",
  completed: "مكتمل",
};

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

function messageText(message?: string) {
  if (message === "payment_confirmed") return "تم تأكيد الدفع وتحديث حالة الطلب";
  if (message === "payment_rejected") return "تم رفض الدفع وأصبح بإمكان العميل رفع إيصال جديد";
  if (message === "order_processing") return "تم نقل الطلب إلى قيد التنفيذ";
  if (message === "order_completed") return "تم تحديد الطلب كمكتمل";
  return undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: reviewPayments }, { data: orders }] = await Promise.all([
    admin.from("payments").select("id, order_id, amount, currency, status, created_at").eq("status", "under_review").order("created_at", { ascending: true }).limit(100),
    admin.from("orders").select("id, order_number, user_id, status, total, currency, admin_note, created_at").in("status", ["paid", "processing"]).order("created_at", { ascending: true }).limit(100),
  ]);

  const reviewOrderIds = [...new Set((reviewPayments ?? []).map((payment) => payment.order_id))];
  const reviewPaymentIds = (reviewPayments ?? []).map((payment) => payment.id);
  const fulfillmentOrderIds = (orders ?? []).map((order) => order.id);

  const [{ data: reviewOrders }, { data: receipts }, { data: items }] = await Promise.all([
    reviewOrderIds.length ? admin.from("orders").select("id, order_number, user_id, status").in("id", reviewOrderIds) : Promise.resolve({ data: [] }),
    reviewPaymentIds.length ? admin.from("payment_receipts").select("id, payment_id, original_filename, mime_type, status, created_at").in("payment_id", reviewPaymentIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    fulfillmentOrderIds.length ? admin.from("order_items").select("order_id, product_name, player_id, player_name").in("order_id", fulfillmentOrderIds) : Promise.resolve({ data: [] }),
  ]);

  const success = messageText(query.message);

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">ORDERS</span>
            <h1>الطلبات</h1>
            <p>مراجعة الدفع والتنفيذ في صفحة تشغيلية واحدة بدون خلطها بإعدادات الكتالوج أو التسعير</p>
          </div>
        </div>

        {success && <div className="notice" role="status">{success}</div>}
        {query.error && <div className="notice notice-error" role="alert">تعذر تنفيذ العملية تحقق من حالة الطلب وحاول مرة أخرى</div>}

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div><h2>دفعات تحت المراجعة</h2><p>القبول أو الرفض يتم عبر RPC آمنة في قاعدة البيانات</p></div>
            <span className="admin-link-icon"><ReceiptText aria-hidden="true" size={20} strokeWidth={2} /></span>
          </div>

          {!reviewPayments?.length ? (
            <div className="admin-empty"><strong>لا توجد دفعات تحت المراجعة</strong><span>أي إيصال جديد سيظهر هنا تلقائيًا</span></div>
          ) : (
            <div className="admin-data-list">
              {reviewPayments.map((payment) => {
                const order = reviewOrders?.find((item) => item.id === payment.order_id);
                const receipt = receipts?.find((item) => item.payment_id === payment.id);
                return (
                  <article className="admin-form-card" style={{ maxWidth: "none" }} key={payment.id}>
                    <div className="admin-panel-head">
                      <div><h2>{order?.order_number ?? "طلب"}</h2><p>{new Intl.NumberFormat("ar-SD").format(payment.amount)} {payment.currency} · {receipt?.original_filename ?? "إيصال"}</p></div>
                      <span className="admin-status is-warning"><Clock3 aria-hidden="true" size={12} strokeWidth={2} /> تحت المراجعة</span>
                    </div>
                    <form className="auth-form" action={reviewPayment}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <label className="field"><span className="field-label">ملاحظة المراجعة</span><textarea name="reason" maxLength={500} rows={3} style={controlStyle} placeholder="سبب الرفض أو ملاحظة داخلية اختيارية" /></label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <button className="btn btn-primary" type="submit" name="decision" value="confirm"><CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} /> تأكيد الدفع</button>
                        <button className="btn btn-secondary" type="submit" name="decision" value="reject"><TriangleAlert aria-hidden="true" size={18} strokeWidth={2} /> رفض الإيصال</button>
                        {order?.order_number && <Link className="btn btn-secondary" href={`/orders/${order.order_number}`}>عرض الطلب</Link>}
                      </div>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div><h2>التنفيذ</h2><p>الطلبات التي تم تأكيد دفعها وتحتاج بدء التنفيذ أو الإكمال</p></div>
            <span className="admin-link-icon"><PackageCheck aria-hidden="true" size={20} strokeWidth={2} /></span>
          </div>

          {!orders?.length ? (
            <div className="admin-empty"><strong>لا توجد طلبات تنتظر التنفيذ</strong><span>بعد تأكيد الدفع سيظهر الطلب هنا</span></div>
          ) : (
            <div className="admin-data-list">
              {orders.map((order) => {
                const item = items?.find((row) => row.order_id === order.id);
                const nextStatus = order.status === "paid" ? "processing" : "completed";
                return (
                  <article className="admin-form-card" style={{ maxWidth: "none" }} key={order.id}>
                    <div className="admin-panel-head">
                      <div><h2>{order.order_number}</h2><p>{item?.product_name ?? "طلب RAIZEY"} · {new Intl.NumberFormat("ar-SD").format(order.total)} {order.currency}</p></div>
                      <span className="admin-status is-success">{STATUS_LABELS[order.status] ?? order.status}</span>
                    </div>
                    <div className="admin-form-grid" style={{ marginBottom: 14 }}>
                      <div className="admin-list-row"><div className="admin-list-main"><span><strong>Player ID</strong><span>{item?.player_id ?? "—"}</span></span></div></div>
                      <div className="admin-list-row"><div className="admin-list-main"><span><strong>اسم اللاعب</strong><span>{item?.player_name ?? "—"}</span></span></div></div>
                    </div>
                    <form className="auth-form" action={progressOrder}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="nextStatus" value={nextStatus} />
                      <label className="field"><span className="field-label">ملاحظة التنفيذ اختيارية</span><input name="note" maxLength={500} placeholder="مثلاً تم الشحن ومراجعة بيانات اللاعب" /></label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <button className="btn btn-primary" type="submit">{nextStatus === "processing" ? "بدء التنفيذ" : "تحديد كمكتمل"}</button>
                        <Link className="btn btn-secondary" href={`/orders/${order.order_number}`}>تفاصيل الطلب</Link>
                      </div>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
