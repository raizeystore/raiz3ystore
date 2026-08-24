import Link from "next/link";
import { Boxes, ChevronLeft, Layers3, Package, Route, Settings2 } from "lucide-react";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminCatalogPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [categories, subcategories, products, variants] = await Promise.all([
    admin.from("categories").select("*", { count: "exact", head: true }),
    admin.from("subcategories").select("*", { count: "exact", head: true }),
    admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .not("subcategory_id", "is", null),
    admin.from("product_variants").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      href: "/admin/catalog/categories",
      label: "الأقسام",
      hint: "حاويات الكتالوج الرئيسية",
      count: categories.count ?? 0,
      icon: Layers3,
    },
    {
      href: "/admin/catalog/subcategories",
      label: "الباقات",
      hint: "كل باقة مرتبطة بقسم واحد",
      count: subcategories.count ?? 0,
      icon: Boxes,
    },
    {
      href: "/admin/catalog/products",
      label: "المنتجات",
      hint: "المنتجات والخيارات النهائية",
      count: products.count ?? 0,
      icon: Package,
    },
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">CATALOG V2</span>
            <h1>مركز إدارة الكتالوج</h1>
            <p>كل مستوى له صفحة مستقلة ووظيفة واحدة واضحة، بدون خلط القسم والباقة والمنتج في قائمة واحدة.</p>
          </div>
          <Link className="btn btn-secondary" href="/">عرض المتجر</Link>
        </div>

        <CatalogNav />

        <section className="catalog-flow-card" aria-labelledby="catalog-flow-title">
          <span className="admin-link-icon"><Route aria-hidden="true" size={21} /></span>
          <div>
            <span className="admin-page-kicker">OFFICIAL HIERARCHY</span>
            <h2 id="catalog-flow-title">قسم ← باقة ← منتج ← خيار ← خيار فرعي</h2>
            <p>لا تظهر المنتجات مباشرة داخل القسم الرئيسي. يجب ربط كل باقة بقسم، وكل منتج بباقة.</p>
          </div>
        </section>

        <section className="catalog-overview-grid" aria-label="ملخص الكتالوج">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link className="catalog-overview-card" href={card.href} key={card.href}>
                <div className="catalog-overview-top">
                  <span className="admin-link-icon"><Icon aria-hidden="true" size={20} /></span>
                  <strong>{card.count.toLocaleString("ar")}</strong>
                </div>
                <h2>{card.label}</h2>
                <p>{card.hint}</p>
                <span className="catalog-card-link">فتح الإدارة <ChevronLeft aria-hidden="true" size={17} /></span>
              </Link>
            );
          })}
        </section>

        <section className="admin-panel admin-section-gap">
          <div className="admin-panel-head">
            <div>
              <h2>حالة الخيارات</h2>
              <p>{(variants.count ?? 0).toLocaleString("ar")} خيار منتج مُسجل حاليًا</p>
            </div>
            <Link className="btn btn-primary" href="/admin/catalog/products">إدارة المنتجات</Link>
          </div>
          <div className="catalog-safety-note">
            <Settings2 aria-hidden="true" size={20} />
            <span>الحذف النهائي غير مستخدم. غيّر الحالة إلى متوقف أو مؤرشف للحفاظ على الطلبات وسجل التدقيق.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
