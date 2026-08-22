import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  payment_review: "مراجعة الدفع",
  paid: "تم تأكيد الدفع",
  processing: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
  refunded: "مسترد",
  rejected: "مرفوض",
};

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login?message=login_required");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, currency, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="التنقل الرئيسي">
            <Link href="/games">الألعاب</Link>
            <Link href="/orders">طلباتي</Link>
            <Link href="/account">حسابي</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />ORDER CENTER</span>
              <h1>طلباتي</h1>
              <p>تابع حالة كل طلب، الدفع، والمراجعة من مكان واحد.</p>
            </div>
            <Link className="btn btn-primary" href="/games">طلب جديد</Link>
          </div>

          {query.error && (
            <div className="notice notice-error" role="alert">تعذر العثور على الطلب المطلوب.</div>
          )}

          {!orders?.length ? (
            <div className="cta-band">
              <div>
                <h2>ما عندك طلبات لسه</h2>
                <p>اختَر لعبة وعرض مناسب، وبعد إنشاء الطلب حيظهر هنا تلقائيًا.</p>
              </div>
              <Link className="btn btn-primary" href="/games">استعرض الألعاب</Link>
            </div>
          ) : (
            <div className="games-grid">
              {orders.map((order) => (
                <Link href={`/orders/${order.order_number}`} key={order.id} className="game-card" data-short="RZ">
                  <span>{new Date(order.created_at).toLocaleDateString("ar-SD")}</span>
                  <h3>{order.order_number}</h3>
                  <p>{STATUS_LABELS[order.status] ?? order.status}</p>
                  <p style={{ marginTop: 10, color: "var(--text)" }}>{formatPrice(order.total, order.currency)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
