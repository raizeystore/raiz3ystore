import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value) + ` ${currency}`;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, game_id, name, slug, description, price, currency")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!product) notFound();

  const { data: game } = await supabase
    .from("games")
    .select("name, slug")
    .eq("id", product.game_id)
    .maybeSingle();

  const { data: claimsData } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(claimsData?.claims?.sub);

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo /></Link>
          <nav className="nav-links" aria-label="التنقل الرئيسي">
            <Link href="/">الرئيسية</Link>
            <Link href="/games">الألعاب</Link>
            <Link href="/account">حسابي</Link>
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-primary" href={isSignedIn ? "/account" : "/login"}>{isSignedIn ? "حسابي" : "دخول"}</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />{game?.name || "RAIZEY STORE"}</span>
            <h1>{product.name}</h1>
            <p className="hero-copy">{product.description || "عرض شحن رقمي متاح عبر RAIZEY STORE."}</p>

            <div className="trust-row">
              <span className="trust-chip">السعر من قاعدة البيانات</span>
              <span className="trust-chip">لا يمكن للمتصفح تغيير السعر النهائي</span>
              <span className="trust-chip">طلب مرتبط بالحساب</span>
            </div>

            <div className="hero-actions">
              {isSignedIn ? (
                <button className="btn btn-primary" type="button" disabled aria-disabled="true">الشراء سيتفعّل مع Checkout الآمن</button>
              ) : (
                <Link className="btn btn-primary" href="/login">سجّل الدخول للمتابعة</Link>
              )}
              <Link className="btn btn-secondary" href={game?.slug ? `/games/${game.slug}` : "/games"}>العودة للعروض</Link>
            </div>
          </div>

          <article className="hero-panel" style={{ minHeight: 360 }}>
            <div className="featured-card featured-card--main">
              <span className="card-kicker">السعر الحالي</span>
              <h3>{product.name}</h3>
              <p>السعر المعروض يُقرأ مباشرة من قاعدة البيانات.</p>
              <div className="price-line">
                <strong>{formatPrice(product.price, product.currency)}</strong>
              </div>
            </div>
            <div className="featured-card featured-card--float">
              <span className="card-kicker">حماية الطلب</span>
              <h3>السعر والتنفيذ من السيرفر</h3>
              <p>عند تفعيل الشراء، السيرفر يعيد قراءة المنتج والسعر بدل الثقة بأي قيمة من العميل.</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
