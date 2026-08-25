import Link from "next/link";
import { Boxes, ChevronLeft, Layers3, Package } from "lucide-react";
import styles from "@/app/admin/catalog/catalog-simple.module.css";
import { CatalogNav } from "@/app/admin/catalog/_components/catalog-nav";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminCatalogPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [categoriesResult, subcategoriesResult, productsResult] = await Promise.all([
    admin.from("categories").select("id", { count: "exact", head: true }),
    admin.from("subcategories").select("id", { count: "exact", head: true }),
    admin.from("products").select("id", { count: "exact", head: true }).not("subcategory_id", "is", null),
  ]);

  const sections = [
    {
      href: "/admin/catalog/categories",
      title: "الأقسام",
      description: "أسماء الأقسام الرئيسية وحالة التفعيل فقط.",
      count: categoriesResult.count ?? 0,
      icon: Layers3,
    },
    {
      href: "/admin/catalog/subcategories",
      title: "التصنيفات",
      description: "التصنيفات أو الباقات التابعة للأقسام مع صورها.",
      count: subcategoriesResult.count ?? 0,
      icon: Boxes,
    },
    {
      href: "/admin/catalog/products",
      title: "المنتجات",
      description: "المنتجات والأسعار والصور والبحث وإدارة الخيارات.",
      count: productsResult.count ?? 0,
      icon: Package,
    },
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <div className={styles.intro}>
          <div>
            <h1>إدارة الكتالوج</h1>
            <p>كل جزء أصبح في صفحة مستقلة حتى لا تختلط الأقسام والتصنيفات والمنتجات في نموذج واحد.</p>
          </div>
          <Link className="btn btn-secondary" href="/">عرض المتجر</Link>
        </div>

        <CatalogNav />

        <section style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 18 }}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link className="admin-panel" href={section.href} key={section.href} style={{ display: "block", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span className="admin-link-icon"><Icon aria-hidden="true" size={21} /></span>
                  <strong style={{ fontSize: 30 }}>{section.count.toLocaleString("ar")}</strong>
                </div>
                <h2 style={{ margin: "18px 0 6px" }}>{section.title}</h2>
                <p className="admin-muted" style={{ margin: 0 }}>{section.description}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, color: "var(--brand-strong)", fontWeight: 800 }}>
                  فتح الصفحة <ChevronLeft aria-hidden="true" size={17} />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="admin-panel" style={{ marginTop: 18 }}>
          <div className="admin-panel-head">
            <div>
              <h2>طريقة العمل الجديدة</h2>
              <p>أضف القسم أولًا، ثم التصنيف، ثم المنتج. إدارة الخيارات تكون من داخل المنتج فقط.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="catalog-safety-note"><span>1</span><strong>الأقسام:</strong><span>اسم + تفعيل أو إيقاف، بدون صور.</span></div>
            <div className="catalog-safety-note"><span>2</span><strong>التصنيفات:</strong><span>تتبع قسمًا واحدًا ولها صورة تظهر في المتجر.</span></div>
            <div className="catalog-safety-note"><span>3</span><strong>المنتجات:</strong><span>تتبع تصنيفًا واحدًا ولها سعر وصورة وخيارات عند الحاجة.</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
