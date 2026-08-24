import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Package, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/src/components/storefront/product-configurator";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { getCatalogProductBySlug } from "@/src/lib/catalog/storefront";
import { createClient } from "@/src/lib/supabase/server";

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", {
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalogProduct = await getCatalogProductBySlug(slug);

  if (catalogProduct) {
    return (
      <main className="site-shell">
        <StoreHeader />
        <section className="product-detail-hero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="مسار الصفحة">
              <Link href="/">الرئيسية</Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <Link href={`/categories/${catalogProduct.category.slug}`}>
                {catalogProduct.category.name}
              </Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <Link href={`/catalog/${catalogProduct.subcategory.slug}`}>
                {catalogProduct.subcategory.name}
              </Link>
              <ChevronLeft aria-hidden="true" size={15} />
              <span aria-current="page">{catalogProduct.name}</span>
            </nav>

            <div className="product-detail-grid">
              <div className="product-detail-copy">
                <span className="eyebrow">
                  <span className="eyebrow-dot" /> {catalogProduct.subcategory.name}
                </span>
                <h1>{catalogProduct.name}</h1>
                <p>
                  {catalogProduct.description ||
                    "حدد الخيار المناسب وأدخل البيانات المطلوبة قبل المتابعة."}
                </p>
                <div className="trust-row">
                  <span className="trust-chip">سعر مطلق لآخر خيار</span>
                  <span className="trust-chip">خيارات من قاعدة البيانات</span>
                  <span className="trust-chip">إعادة تسعير خادمية قبل الطلب</span>
                </div>
                <div className="product-detail-media">
                  {catalogProduct.imageUrl ? (
                    <Image
                      src={catalogProduct.imageUrl}
                      alt={catalogProduct.name}
                      fill
                      priority
                      sizes="(max-width: 900px) 100vw, 46vw"
                    />
                  ) : (
                    <Package aria-hidden="true" size={64} />
                  )}
                </div>
              </div>

              <ProductConfigurator
                productName={catalogProduct.name}
                baseCustomerPrice={catalogProduct.baseCustomerPrice}
                currency={catalogProduct.currency}
                variants={catalogProduct.variants}
                inputFields={catalogProduct.inputFields}
                suboptionsRequired={catalogProduct.suboptionsRequired}
              />
            </div>
          </div>
        </section>
        <StoreFooter />
      </main>
    );
  }

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, game_id, name, slug, description, price, currency")
    .eq("slug", slug)
    .eq("status", "active")
    .is("subcategory_id", null)
    .maybeSingle();

  if (!product?.game_id) notFound();

  const [{ data: game }, { data: claimsData }] = await Promise.all([
    supabase
      .from("games")
      .select("name, slug")
      .eq("id", product.game_id)
      .maybeSingle(),
    supabase.auth.getClaims(),
  ]);
  const isSignedIn = Boolean(claimsData?.claims?.sub);

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className="section">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              {game?.name || "RAIZEY STORE"}
            </span>
            <h1>{product.name}</h1>
            <p className="hero-copy">
              {product.description || "عرض شحن رقمي متاح عبر RAIZEY STORE."}
            </p>
            <div className="trust-row">
              <span className="trust-chip">السعر من قاعدة البيانات</span>
              <span className="trust-chip">لا يمكن للمتصفح تغيير السعر النهائي</span>
              <span className="trust-chip">طلب مرتبط بالحساب</span>
            </div>
            <div className="hero-actions">
              {isSignedIn ? (
                <Link className="btn btn-primary" href={`/checkout/${product.slug}`}>
                  متابعة للشراء
                </Link>
              ) : (
                <Link className="btn btn-primary" href="/login?message=login_required">
                  سجّل الدخول للمتابعة
                </Link>
              )}
              <Link
                className="btn btn-secondary"
                href={game?.slug ? `/games/${game.slug}` : "/games"}
              >
                العودة للعروض
              </Link>
            </div>
          </div>

          <article className="hero-panel product-legacy-panel">
            <div className="featured-card featured-card--main">
              <span className="card-kicker">السعر الحالي</span>
              <h2>{product.name}</h2>
              <p>هذا عرض من الكتالوج المتوافق السابق.</p>
              <div className="price-line">
                <strong>{formatPrice(product.price, product.currency)}</strong>
              </div>
            </div>
            <div className="featured-card featured-card--float">
              <ShieldCheck aria-hidden="true" size={24} />
              <span className="card-kicker">حماية الطلب</span>
              <h3>السعر والتنفيذ من السيرفر</h3>
              <p>يبقى مسار الطلب القديم متاحًا أثناء الانتقال التدريجي.</p>
            </div>
          </article>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
