import Image from "next/image";
import Link from "next/link";
import { Boxes, ChevronLeft, Package } from "lucide-react";
import { notFound } from "next/navigation";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { getSubcategoryBySlug } from "@/src/lib/catalog/storefront";

export const revalidate = 60;

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getSubcategoryBySlug(slug);
  if (!catalog) notFound();
  const { category, subcategory, products } = catalog;

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className="catalog-page-hero">
        <div className="container catalog-page-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="مسار الصفحة">
              <Link href="/">الرئيسية</Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <Link href={`/categories/${category.slug}`}>{category.name}</Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <span aria-current="page">{subcategory.name}</span>
            </nav>
            <span className="eyebrow"><span className="eyebrow-dot" /> باقة RAIZEY</span>
            <h1>{subcategory.name}</h1>
            <p>{subcategory.description || "اختر المنتج، ثم حدد الخيار والحجم المناسب من صفحة واحدة."}</p>
          </div>
          <div className="catalog-page-mark" aria-hidden="true">
            <Boxes size={46} />
            <span>{products.length.toLocaleString("ar")} منتج</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">PRODUCTS</span><h2>اختر المنتج</h2></div>
            <p>أحجام مثل 60 أو 325 أو 660 تظهر كخيارات داخل المنتج، وليست صفحات مستقلة.</p>
          </div>

          {products.length === 0 ? (
            <div className="store-empty-state">
              <Package aria-hidden="true" size={32} />
              <div><h3>لا توجد منتجات منشورة</h3><p>سيظهر أول منتج هنا بعد ربطه بهذه الباقة ونشره.</p></div>
            </div>
          ) : (
            <div className="product-card-grid">
              {products.map((product) => (
                <Link className="store-product-card" href={`/products/${product.slug}`} key={product.id}>
                  <div className="store-product-media">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 280px" />
                    ) : (
                      <Package aria-hidden="true" size={38} />
                    )}
                  </div>
                  <small>{subcategory.name}</small>
                  <h3>{product.name}</h3>
                  <p>{product.description || "افتح المنتج لاختيار الباقة والبيانات المطلوبة."}</p>
                  {product.startingPriceUsd !== null && (
                    <span className="product-usd-hint">
                      يبدأ من {product.startingPriceUsd.toLocaleString("ar", { maximumFractionDigits: 4 })} USD
                    </span>
                  )}
                  <span className="store-card-action">عرض الخيارات <ChevronLeft aria-hidden="true" size={17} /></span>
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
