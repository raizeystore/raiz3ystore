import Image from "next/image";
import Link from "next/link";
import { PackageSearch, Search } from "lucide-react";
import styles from "@/app/search/search.module.css";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { searchCatalogProducts } from "@/src/lib/catalog/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim();
  const results = query.length >= 2 ? await searchCatalogProducts(query) : [];

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className={styles.page}>
        <div className="container">
          <div className={styles.head}>
            <h1>البحث عن المنتجات</h1>
            <p>ابحث باسم المنتج أو التصنيف، مثل PUBG أو 60 UC.</p>
          </div>

          <form className={styles.form} action="/search" method="get">
            <input className={styles.input} name="q" defaultValue={query} minLength={2} maxLength={80} placeholder="اكتب اسم المنتج" aria-label="اسم المنتج" />
            <button className="btn btn-primary" type="submit"><Search aria-hidden="true" size={18} /> بحث</button>
          </form>

          {query.length < 2 ? (
            <div className={styles.empty}>اكتب حرفين على الأقل لبدء البحث.</div>
          ) : results.length === 0 ? (
            <div className={styles.empty}>لا توجد منتجات مطابقة لـ “{query}”.</div>
          ) : (
            <div className={styles.grid}>
              {results.map((product) => (
                <Link className={styles.card} href={`/products/${product.slug}`} key={product.id}>
                  <div className={styles.media}>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, 240px" />
                    ) : (
                      <PackageSearch aria-hidden="true" size={36} />
                    )}
                  </div>
                  {product.subcategoryName && <small>{product.subcategoryName}</small>}
                  <h2>{product.name}</h2>
                  {product.description && <p>{product.description}</p>}
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
