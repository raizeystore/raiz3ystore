import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Layers3 } from "lucide-react";
import { notFound } from "next/navigation";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { getCategoryBySlug } from "@/src/lib/catalog/storefront";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className="catalog-page-hero">
        <div className="container catalog-page-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="مسار الصفحة">
              <Link href="/">الرئيسية</Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <span aria-current="page">{category.name}</span>
            </nav>
            <span className="eyebrow"><span className="eyebrow-dot" /> قسم RAIZEY</span>
            <h1>{category.name}</h1>
            <p>{category.description || "اختر الباقة أو الخدمة المطلوبة من التصنيفات المنشورة داخل هذا القسم."}</p>
          </div>
          <div className="catalog-page-mark" aria-hidden="true">
            <Layers3 size={46} />
            <span>{category.subcategories.length.toLocaleString("ar")} باقة</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">SUBCATEGORIES</span><h2>الباقات والخدمات</h2></div>
            <p>كل بطاقة تفتح صفحة واحدة تحتوي منتجاتها وخياراتها فقط.</p>
          </div>

          {category.subcategories.length === 0 ? (
            <div className="store-empty-state">
              <Layers3 aria-hidden="true" size={32} />
              <div><h3>لا توجد باقات منشورة</h3><p>سيظهر المحتوى هنا بعد ربط أول باقة بهذا القسم ونشرها.</p></div>
            </div>
          ) : (
            <div className="subcategory-grid subcategory-grid--wide">
              {category.subcategories.map((subcategory) => (
                <Link className="subcategory-card" href={`/catalog/${subcategory.slug}`} key={subcategory.id}>
                  <div className="subcategory-media">
                    {subcategory.imageUrl ? (
                      <Image src={subcategory.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 360px" />
                    ) : (
                      <Layers3 aria-hidden="true" size={34} />
                    )}
                  </div>
                  <div>
                    <span>{category.name}</span>
                    <h3>{subcategory.name}</h3>
                    <p>{subcategory.description || "عرض المنتجات والخيارات المتاحة داخل هذه الباقة."}</p>
                  </div>
                  <ChevronLeft className="subcategory-arrow" aria-hidden="true" size={19} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
