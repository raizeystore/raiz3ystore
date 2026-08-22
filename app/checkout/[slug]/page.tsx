import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createOrder } from "@/app/checkout/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login?message=login_required");

  const [{ data: product }, { data: profile }, { data: paymentMethods }] = await Promise.all([
    supabase
      .from("products")
      .select("id, game_id, name, slug, description, price, currency")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name, is_active")
      .eq("id", userId)
      .single(),
    supabase
      .from("payment_methods")
      .select("id, name, code, instructions, account_label, account_identifier")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();
  if (!profile?.is_active) redirect("/account?error=account_inactive");

  const { data: game } = await supabase
    .from("games")
    .select("name, slug")
    .eq("id", product.game_id)
    .maybeSingle();

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
        <div className="container hero-grid">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />CHECKOUT آمن</span>
            <h1>أكمل طلب <span>{product.name}</span></h1>
            <p className="hero-copy">
              السعر النهائي لا يُرسل من المتصفح. عند الضغط على إنشاء الطلب، السيرفر يعيد قراءة المنتج والسعر وطريقة الدفع من قاعدة البيانات قبل إنشاء أي سجل.
            </p>

            {query.error && (
              <div className="notice notice-error" role="alert" style={{ marginTop: 22 }}>
                تعذر إنشاء الطلب. تأكد من بيانات اللاعب وطريقة الدفع وحاول مرة أخرى.
              </div>
            )}

            <form className="auth-form" action={createOrder} style={{ marginTop: 26, maxWidth: 620 }}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productSlug" value={product.slug} />

              <label className="field">
                <span className="field-label">معرّف اللاعب / Player ID *</span>
                <input
                  name="playerId"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="off"
                  placeholder="اكتب ID اللاعب بدقة"
                />
              </label>

              <label className="field">
                <span className="field-label">اسم اللاعب (اختياري)</span>
                <input
                  name="playerName"
                  type="text"
                  maxLength={120}
                  autoComplete="off"
                  placeholder="اسم الحساب داخل اللعبة"
                />
              </label>

              <label className="field">
                <span className="field-label">طريقة الدفع *</span>
                <select name="paymentMethodId" required defaultValue="">
                  <option value="" disabled>اختر طريقة الدفع</option>
                  {(paymentMethods ?? []).map((method) => (
                    <option value={method.id} key={method.id}>{method.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">ملاحظة للطلب (اختياري)</span>
                <textarea
                  name="customerNote"
                  maxLength={500}
                  rows={4}
                  placeholder="أي تفاصيل إضافية نحتاج نعرفها قبل التنفيذ"
                />
              </label>

              <button className="btn btn-primary btn-full" type="submit" disabled={!paymentMethods?.length}>
                {paymentMethods?.length ? "إنشاء الطلب والمتابعة للدفع" : "لا توجد طريقة دفع مفعلة الآن"}
              </button>
            </form>
          </div>

          <div>
            <article className="auth-card" style={{ width: "100%", maxWidth: "none" }}>
              <div className="auth-card-header">
                <span className="card-kicker">ملخص الطلب</span>
                <h2>{product.name}</h2>
                <p>{game?.name ?? "RAIZEY STORE"}</p>
              </div>
              <div className="price-line">
                <small>المبلغ الحالي</small>
                <strong>{formatPrice(product.price, product.currency)}</strong>
              </div>
              <div className="trust-row">
                <span className="trust-chip">حساب: {profile.display_name || "مستخدم RAIZEY"}</span>
                <span className="trust-chip">كمية: 1</span>
              </div>
            </article>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {(paymentMethods ?? []).map((method) => (
                <article className="info-card" key={method.id}>
                  <div className="icon-box">$</div>
                  <h3>{method.name}</h3>
                  {method.account_label && <p>{method.account_label}</p>}
                  {method.account_identifier && <p style={{ color: "var(--text)" }}>{method.account_identifier}</p>}
                  {method.instructions && <p style={{ marginTop: 8 }}>{method.instructions}</p>}
                </article>
              ))}
            </div>

            <div className="hero-actions">
              <Link className="btn btn-secondary" href={`/products/${product.slug}`}>العودة للعرض</Link>
              <Link className="btn btn-secondary" href={game?.slug ? `/games/${game.slug}` : "/games"}>عروض اللعبة</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
