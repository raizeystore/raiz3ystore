import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: games, error } = await supabase
    .from("games")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

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
              <span className="eyebrow"><span className="eyebrow-dot" />كتالوج RAIZEY</span>
              <h1>الألعاب والخدمات</h1>
              <p>كل لعبة تظهر هنا مباشرة من قاعدة البيانات، بدون أسعار أو منتجات وهمية.</p>
            </div>
          </div>

          {error ? (
            <div className="notice notice-error" role="alert">تعذر تحميل الألعاب الآن. حاول مرة أخرى لاحقًا.</div>
          ) : games && games.length > 0 ? (
            <div className="games-grid">
              {games.map((game) => (
                <Link
                  className="game-card"
                  data-short={game.name.slice(0, 3).toUpperCase()}
                  href={`/games/${game.slug}`}
                  key={game.id}
                >
                  <span>RAIZEY GAME TOP-UP</span>
                  <h3>{game.name}</h3>
                  <p>{game.description || "استعرض المنتجات والعروض المتاحة لهذه اللعبة."}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cta-band">
              <div>
                <h2>الكتالوج قيد التجهيز</h2>
                <p>ما في ألعاب منشورة حاليًا. أول ما نضيف الألعاب من لوحة الإدارة حتظهر هنا تلقائيًا.</p>
              </div>
              <Link className="btn btn-secondary" href="/">العودة للرئيسية</Link>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-row">
          <BrandLogo />
          <span>© 2026 RAIZEY STORE — جميع الحقوق محفوظة.</span>
        </div>
      </footer>
    </main>
  );
}
