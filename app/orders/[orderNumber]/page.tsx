import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { uploadReceipt } from "@/app/orders/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

const ORDER_STATUS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  payment_review: "الإيصال تحت المراجعة",
  paid: "تم تأكيد الدفع",
  processing: "قيد التنفيذ",
  completed: "اكتمل الطلب",
  cancelled: "تم إلغاء الطلب",
  refunded: "تم الاسترداد",
  rejected: "تم رفض الدفع",
};

const PAYMENT_STATUS: Record<string, string> = {
  pending: "بانتظار الإيصال",
  under_review: "تحت المراجعة",
  confirmed: "مؤكد",
  rejected: "مرفوض — يمكنك رفع إيصال جديد",
  refunded: "مسترد",
};

const RECEIPT_STATUS: Record<string, string> = {
  pending: "تم الاستلام",
  processing: "جاري الفحص",
  approved: "مقبول",
  rejected: "مرفوض",
  manual_review: "مراجعة يدوية",
};

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { orderNumber } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login?message=login_required");

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .single();

  const isAdmin = viewerProfile?.role === "admin" && viewerProfile.is_active;

  let orderQuery = supabase
    .from("orders")
    .select("id, order_number, user_id, status, subtotal, total, currency, customer_note, admin_note, created_at")
    .eq("order_number", orderNumber);

  if (!isAdmin) orderQuery = orderQuery.eq("user_id", userId);

  const { data: order } = await orderQuery.maybeSingle();
  if (!order) notFound();

  const [{ data: items }, { data: payment }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, product_name, unit_price, quantity, line_total, player_id, player_name")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("payments")
      .select("id, payment_method_id, amount, currency, status, transaction_reference, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const [{ data: paymentMethod }, { data: receipts }] = await Promise.all([
    payment
      ? supabase
          .from("payment_methods")
          .select("name, instructions, account_label, account_identifier")
          .eq("id", payment.payment_method_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    payment
      ? supabase
          .from("payment_receipts")
          .select("id, storage_path, original_filename, mime_type, status, review_reason, created_at")
          .eq("payment_id", payment.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const latestReceipt = receipts?.[0] ?? null;
  let receiptUrl: string | null = null;

  if (latestReceipt?.storage_path) {
    const { data: signed } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(latestReceipt.storage_path, 300);
    receiptUrl = signed?.signedUrl ?? null;
  }

  const canUploadReceipt = !isAdmin && payment && ["pending", "rejected"].includes(payment.status);
  const backHref = isAdmin ? "/admin/orders" : "/orders";
  const backLabel = isAdmin ? "تنفيذ الطلبات" : "كل الطلبات";

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="التنقل الرئيسي">
            <Link href={backHref}>{backLabel}</Link>
            {isAdmin && <Link href="/admin">لوحة الإدارة</Link>}
            <Link href="/games">الألعاب</Link>
            <Link href="/account">حسابي</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />{ORDER_STATUS[order.status] ?? order.status}</span>
              <h1>{order.order_number}</h1>
              <p>تم إنشاء الطلب بتاريخ {new Date(order.created_at).toLocaleString("ar-SD")}.</p>
            </div>
            <Link className="btn btn-secondary" href={backHref}>{backLabel}</Link>
          </div>

          {isAdmin && (
            <div className="notice" role="status" style={{ marginBottom: 20 }}>
              عرض إداري محمي — يمكنك فحص بيانات اللاعب والإيصال، لكن رفع الإيصال متاح لصاحب الطلب فقط.
            </div>
          )}
          {query.message === "order_created" && !isAdmin && (
            <div className="notice" role="status">تم إنشاء طلبك بنجاح. أكمل التحويل ثم ارفع الإيصال من هذه الصفحة.</div>
          )}
          {query.message === "receipt_submitted" && !isAdmin && (
            <div className="notice" role="status">تم رفع الإيصال وتحويل الطلب إلى مراجعة الدفع.</div>
          )}
          {query.error && (
            <div className="notice notice-error" role="alert">تعذر تنفيذ العملية. تأكد من نوع وحجم الملف وحالة الدفع ثم حاول مرة أخرى.</div>
          )}

          <div className="info-grid">
            <article className="info-card"><div className="icon-box">#</div><h3>حالة الطلب</h3><p>{ORDER_STATUS[order.status] ?? order.status}</p></article>
            <article className="info-card"><div className="icon-box">$</div><h3>المبلغ</h3><p>{formatPrice(order.total, order.currency)}</p></article>
            <article className="info-card"><div className="icon-box">✓</div><h3>حالة الدفع</h3><p>{payment ? (PAYMENT_STATUS[payment.status] ?? payment.status) : "—"}</p></article>
          </div>

          <div className="hero-grid" style={{ marginTop: 24, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16 }}>
              <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
                <div className="auth-card-header"><h2>تفاصيل الشحن</h2><p>راجع الـPlayer ID قبل تنفيذ الطلب.</p></div>
                <div style={{ display: "grid", gap: 14 }}>
                  {(items ?? []).map((item) => (
                    <div className="info-card" key={item.id}>
                      <h3>{item.product_name}</h3>
                      <p>Player ID: <span style={{ color: "var(--text)" }}>{item.player_id || "—"}</span></p>
                      {item.player_name && <p>اسم اللاعب: <span style={{ color: "var(--text)" }}>{item.player_name}</span></p>}
                      <p>السعر: <span style={{ color: "var(--text)" }}>{formatPrice(item.unit_price, order.currency)}</span></p>
                    </div>
                  ))}
                </div>
              </article>

              {paymentMethod && (
                <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
                  <div className="auth-card-header"><span className="card-kicker">طريقة الدفع</span><h2>{paymentMethod.name}</h2><p>{paymentMethod.instructions || "حوّل المبلغ الموضح ثم ارفع صورة الإيصال."}</p></div>
                  {paymentMethod.account_label && <p>{paymentMethod.account_label}</p>}
                  {paymentMethod.account_identifier && <p style={{ fontSize: 22, fontWeight: 900, color: "var(--brand-strong)" }}>{paymentMethod.account_identifier}</p>}
                </article>
              )}
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
                <div className="auth-card-header"><span className="card-kicker">إثبات الدفع</span><h2>{isAdmin ? "فحص الإيصال" : "رفع الإيصال"}</h2><p>PNG / JPG / WEBP / PDF، وبحد أقصى 5MB. الملفات تحفظ في Storage خاص وليست عامة.</p></div>

                {latestReceipt && (
                  <div className={latestReceipt.status === "rejected" ? "notice notice-error" : "notice"}>
                    آخر إيصال: {RECEIPT_STATUS[latestReceipt.status] ?? latestReceipt.status}
                    {latestReceipt.review_reason ? ` — ${latestReceipt.review_reason}` : ""}
                  </div>
                )}

                {receiptUrl && (
                  <a className="btn btn-secondary btn-full" href={receiptUrl} target="_blank" rel="noreferrer">
                    فتح الإيصال لمدة 5 دقائق
                  </a>
                )}

                {canUploadReceipt ? (
                  <form className="auth-form" action={uploadReceipt}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="orderNumber" value={order.order_number} />
                    <label className="field"><span className="field-label">اختر ملف الإيصال *</span><input type="file" name="receipt" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label>
                    <button className="btn btn-primary btn-full" type="submit">رفع الإيصال للمراجعة</button>
                  </form>
                ) : !isAdmin ? (
                  <p style={{ color: "var(--text-muted)" }}>رفع إيصال جديد غير متاح في حالة الدفع الحالية.</p>
                ) : null}
              </article>

              {(order.customer_note || order.admin_note) && (
                <article className="info-card"><h3>ملاحظات الطلب</h3>{order.customer_note && <p>ملاحظة العميل: {order.customer_note}</p>}{order.admin_note && <p style={{ marginTop: 8 }}>مراجعة الإدارة: {order.admin_note}</p>}</article>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
