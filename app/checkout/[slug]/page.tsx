import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { createOrder } from "@/app/checkout/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import { IconBox } from "@/src/components/ui/icon-box";
import { createClient } from "@/src/lib/supabase/server";

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

function checkoutError(code?: string) {
  if (code === "rate_limited") return "تم إنشاء عدة طلبات خلال وقت قصير. انتظر قليلًا قبل إنشاء طلب جديد.";
  if (code === "player_id_required") return "أدخل بيانات Player ID المطلوبة لهذا العرض.";
  if (code === "player_name_required") return "أدخل اسم اللاعب المطلوب لهذا العرض.";
  if (code) return "تعذر إنشاء الطلب. تأكد من البيانات وطريقة الدفع وحاول مرة أخرى.";
  return null;
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
  const checkoutToken = crypto.randomUUID();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login?message=login_required");

  const [{ data: product }, { data: profile }, { data: paymentMethods }] = await Promise.all([
    supabase
      .from("products")
      .select("id, game_id, name, slug, description, price, currency, pricing_mode, player_id_required, player_name_required, player_id_label, player_name_label")
      .eq("slug", slug)
      .eq("status", "active")
      .is("subcategory_id", null)
      .maybeSingle(),
    supabase.from("profiles").select("display_name, is_active").eq("id", userId).single(),
    supabase
      .from("payment_methods")
      .select("id, name, code, instructions, account_label, account_identifier")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);

  if (!product?.game_id) notFound();
  if (!profile?.is_active) redirect("/account?error=account_inactive");

  const { data: game } = await supabase.from("games").select("name, slug").eq("id", product.game_id).maybeSingle();
  const errorMessage = checkoutError(query.error);

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
              السعر النهائي لا يُرسل من المتصفح. السيرفر يعيد قراءة المنتج والسعر وطريقة الدفع ومتطلبات بيانات اللاعب من قاعدة البيانات قبل إنشاء الطلب.
            </p>

            {errorMessage && (
              <div className="notice notice-error" role="alert" style={{ marginTop: 22 }}>{errorMessage}</div>
            )}

            <form className="auth-form" action={createOrder} style={{ marginTop: 26, maxWidth: 620 }}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productSlug" value={product.slug} />
              <input type="hidden" name="checkoutToken" value={checkoutToken} />

              <label className="field">
                <span className="field-label">
                  {product.player_id_label} {product.player_id_required ? "*" : "(اختياري)"}
                </span>
                <input
                  name="playerId"
                  type="text"
                  required={product.player_id_required}
                  maxLength={120}
                  autoComplete="off"
                  placeholder={`اكتب ${product.player_id_label} بدقة`}
                />
              </label>

              <label className="field">
                <span className="field-label">
                  {product.player_name_label} {product.player_name_required ? "*" : "(اختياري)"}
                </span>
                <input
                  name="playerName"
                  type="text"
                  required={product.player_name_required}
                  maxLength={120}
                  autoComplete="off"
                  placeholder={product.player_name_label}
                />
              </label>

              <label className="field">
                <span className="field-label">طريقة الدفع *</span>
                <select name="paymentMethodId" required defaultValue="" style={controlStyle}>
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
                  style={controlStyle}
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
                <span className="trust-chip">حماية من الطلب المكرر</span>
                {product.pricing_mode === "usd_auto" && <span className="trust-chip">سعر محدث تلقائيًا</span>}
              </div>
            </article>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {(paymentMethods ?? []).map((method) => (
                <article className="info-card" key={method.id}>
                  <IconBox icon={WalletCards} />
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
