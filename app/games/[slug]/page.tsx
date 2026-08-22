import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat("ar-SD", {
    maximumFractionDigits: 2,
  }).format(value) + ` ${currency}`;
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!game) notFound();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, currency, sort_order")
    .eq("game_id", game.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("price", { ascending: true });

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
            <Link className="btn btn-primary" href="/login">دخول</Link>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />RAIZEY GAME TOP-UP</span>
              <h1>{game.name}</h1>
              <p>{game.description || "اختر العرض المناسب لك من المنتجات المتاحة."}</p>
            </div>
            <Link className="btn btn-secondary" href="/games">كل الألعاب</Link>
          </div>

          {error ? (
            <div className="notice notice-error" role="alert">تعذر تحميل المنتجات الآن.</div>
          ) : products && products.length > 0 ? (
            <div className="info-grid">
              {products.map((product) => (
                <article className="info-card" key={product.id}>
                  <div className="icon-box">R</div>
                  <h3>{product.name}</h3>
                  <p>{product.description || "عرض شحن متاح من RAIZEY STORE."}</p>
                  <div className="price-line">
                    <strong>{formatPrice(product.price, product.currency)}</strong>
                    <Link className="btn btn-primary" href={`/products/${product.slug}`}>اختيار العرض</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cta-band">
              <div>
                <h2>ما في عروض منشورة حاليًا</h2>
                <p>العروض الفعلية حتظهر هنا بمجرد إضافتها من لوحة الإدارة.</p>
              </div>
              <Link className="btn btn-secondary" href="/games">اختيار لعبة ثانية</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
