import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/src/components/brand-logo";
import { createClient } from "@/src/lib/supabase/server";

async function getCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "profiles" | "games" | "products" | "orders" | "payments",
) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  return error ? null : count ?? 0;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, display_name")
    .eq("id", userId)
    .single();

  if (!profile || profile.role !== "admin" || !profile.is_active) redirect("/account");

  const [users, games, products, orders, payments] = await Promise.all([
    getCount(supabase, "profiles"),
    getCount(supabase, "games"),
    getCount(supabase, "products"),
    getCount(supabase, "orders"),
    getCount(supabase, "payments"),
  ]);

  const stats = [
    { label: "المستخدمون", value: users },
    { label: "الألعاب", value: games },
    { label: "المنتجات", value: products },
    { label: "الطلبات", value: orders },
    { label: "المدفوعات", value: payments },
  ];

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="RAIZEY STORE الرئيسية"><BrandLogo compact /></Link>
          <nav className="nav-links" aria-label="تنقل الإدارة">
            <Link href="/admin">نظرة عامة</Link>
            <Link href="/games">واجهة المتجر</Link>
            <Link href="/account">حسابي</Link>
          </nav>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />ADMIN CONTROL</span>
              <h1>لوحة إدارة RAIZEY</h1>
              <p>{profile.display_name ? `مرحبًا ${profile.display_name}. ` : ""}هذه النسخة للقراءة والمراقبة فقط إلى أن نفعّل مسار الكتابة الموثوق من السيرفر.</p>
            </div>
          </div>

          <div className="games-grid">
            {stats.map((stat) => (
              <article className="game-card" data-short="R" key={stat.label}>
                <span>RAIZEY METRIC</span>
                <h3>{stat.value === null ? "—" : stat.value.toLocaleString("ar")}</h3>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>

          <div className="cta-band" style={{ marginTop: 28 }}>
            <div>
              <h2>الإدارة الكتابية مقفولة حاليًا</h2>
              <p>إضافة الألعاب والمنتجات وتغيير الأسعار وحالات الطلبات ستعمل من Server Actions فقط، وليس مباشرة من المتصفح.</p>
            </div>
            <Link className="btn btn-secondary" href="/games">عرض الكتالوج</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
