import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  ChevronLeft,
  ClipboardCheck,
  Gauge,
  Headphones,
  Layers3,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import { BannerSlider } from "@/src/components/storefront/banner-slider";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { StoreTicker } from "@/src/components/storefront/store-ticker";
import { getStorefrontHome } from "@/src/lib/catalog/storefront";
import { getTickerMessages } from "@/src/lib/storefront/shell";

export const revalidate = 60;

const benefits = [
  {
    icon: ShieldCheck,
    title: "تسعير من المصدر",
    text: "الأسعار والخيارات تُقرأ من قاعدة البيانات، ويُعاد التحقق منها خادميًا قبل أي عملية مالية.",
  },
  {
    icon: Gauge,
    title: "مصمم للموبايل",
    text: "تدرج واضح من القسم إلى الباقة ثم الخيار، بدون قوائم مختلطة أو خطوات مبهمة.",
  },
  {
    icon: Headphones,
    title: "دعم عند الحاجة",
    text: "حالة الطلب واضحة، والحالات غير المؤكدة تنتقل للمراجعة بدل قبول دفع غير موثوق.",
  },
];

const steps = [
  {
    icon: Layers3,
    title: "اختر القسم والباقة",
    text: "ابدأ بالقسم، ثم افتح الباقة المطلوبة بدون خلطها مع المنتجات النهائية.",
  },
  {
    icon: MousePointerClick,
    title: "حدد الخيار وبياناتك",
    text: "اختر الحجم أو الخدمة وأدخل فقط البيانات التي يحتاجها هذا المنتج.",
  },
  {
    icon: ClipboardCheck,
    title: "راجع وأكمل بأمان",
    text: "راجع السعر والبيانات في Checkout مستقل قبل إنشاء الطلب أو بدء الدفع.",
  },
];

export default async function HomePage() {
  const [{ banners, categories, popularProducts }, tickerMessages] = await Promise.all([
    getStorefrontHome(),
    getTickerMessages(),
  ]);

  return (
    <main className="site-shell">
      <StoreHeader />
      <BannerSlider banners={banners} />
      <StoreTicker messages={tickerMessages} />

      {popularProducts.length > 0 && (
        <section className="section" id="most-purchased">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">من الطلبات المكتملة</span>
                <h2>الأكثر شراءً</h2>
              </div>
              <p>ترتيب حقيقي محسوب من كميات الطلبات المكتملة فقط، بدون اختيار يدوي أو منتجات عشوائية.</p>
            </div>
            <div className="product-card-grid">
              {popularProducts.map((product, index) => (
                <Link className="store-product-card" href={`/products/${product.slug}`} key={product.id}>
                  <div className="store-product-media">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 280px" />
                    ) : (
                      <Boxes aria-hidden="true" size={36} />
                    )}
                    <span>#{index + 1}</span>
                  </div>
                  <small>{product.subcategoryName || "RAIZEY STORE"}</small>
                  <h3>{product.name}</h3>
                  <span className="store-card-action">اختيار المنتج <ChevronLeft aria-hidden="true" size={17} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-muted catalog-home" id="catalog">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> كتالوج RAIZEY</span>
              <h2>ابدأ من القسم الصحيح</h2>
            </div>
            <p>الأقسام حاويات واضحة، وتحت كل قسم تظهر الباقات المرتبطة به فقط.</p>
          </div>

          {categories.length === 0 ? (
            <div className="store-empty-state">
              <Boxes aria-hidden="true" size={32} />
              <div>
                <h3>الكتالوج قيد التجهيز</h3>
                <p>لا توجد أقسام منشورة حاليًا. ستظهر الأقسام والباقات تلقائيًا بعد نشرها من لوحة الإدارة.</p>
              </div>
            </div>
          ) : (
            <div className="category-section-list">
              {categories.map((category) => (
                <section className="category-section" aria-labelledby={`category-${category.id}`} key={category.id}>
                  <div className="category-section-head">
                    <div>
                      <span>SECTION</span>
                      <h3 id={`category-${category.id}`}>{category.name}</h3>
                      {category.description && <p>{category.description}</p>}
                    </div>
                    <Link className="btn btn-secondary" href={`/categories/${category.slug}`}>
                      عرض القسم <ChevronLeft aria-hidden="true" size={17} />
                    </Link>
                  </div>

                  {category.subcategories.length === 0 ? (
                    <div className="category-inline-empty">لا توجد باقات منشورة داخل هذا القسم حتى الآن.</div>
                  ) : (
                    <div className="subcategory-grid">
                      {category.subcategories.map((subcategory) => (
                        <Link className="subcategory-card" href={`/catalog/${subcategory.slug}`} key={subcategory.id}>
                          <div className="subcategory-media">
                            {subcategory.imageUrl ? (
                              <Image src={subcategory.imageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 280px" />
                            ) : (
                              <Layers3 aria-hidden="true" size={32} />
                            )}
                          </div>
                          <div>
                            <span>{category.name}</span>
                            <h4>{subcategory.name}</h4>
                            <p>{subcategory.description || "استعرض المنتجات والخيارات المتاحة داخل هذه الباقة."}</p>
                          </div>
                          <ChevronLeft className="subcategory-arrow" aria-hidden="true" size={19} />
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="why-us">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">RAIZEY STANDARD</span><h2>هدوء في الواجهة. صرامة في الخلفية.</h2></div>
            <p>تجربة شراء بسيطة لا تعني اختصار قواعد الأمان أو الاعتماد على بيانات المتصفح.</p>
          </div>
          <div className="info-grid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className="info-card" key={benefit.title}>
                  <span className="premium-icon-box"><Icon aria-hidden="true" size={22} /></span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">HOW IT WORKS</span><h2>من الاختيار إلى المراجعة</h2></div>
            <p>كل خطوة لها غرض واحد واضح، خصوصًا على شاشة بعرض 393px.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <div className="step-number"><Icon aria-hidden="true" size={20} /></div>
                  <span className="card-kicker">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band premium-cta">
          <div><span className="card-kicker">YOUR NEXT TOP-UP</span><h2>جاهز تختار خدمتك؟</h2><p>ابدأ بالكتالوج، أو ادخل إلى حسابك لمتابعة طلباتك الحالية.</p></div>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="#catalog">تصفح الكتالوج</Link>
            <Link className="btn btn-secondary" href="/account">فتح حسابي</Link>
          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
