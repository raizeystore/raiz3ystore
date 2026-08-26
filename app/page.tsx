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
import styles from "./home.module.css";

export const revalidate = 60;

const benefits = [
  {
    icon: ShieldCheck,
    title: "أسعار محسوبة بأمان",
    text: "السعر النهائي يعاد حسابه من الخادم قبل السلة والطلب والدفع، ولا يعتمد على قيمة قادمة من المتصفح.",
  },
  {
    icon: Gauge,
    title: "مصمم للهاتف أولًا",
    text: "الخدمة والعرض وبيانات التنفيذ تظهر بترتيب واضح يناسب شاشة 393px بدون خطوات إضافية مربكة.",
  },
  {
    icon: Headphones,
    title: "متابعة واضحة",
    text: "حالة الطلب والتنبيهات والمراجعة تظهر من حسابك، والحالات غير المؤكدة تنتقل للمراجعة بدل قبولها عشوائيًا.",
  },
];

const steps = [
  {
    icon: Layers3,
    title: "اختر خدمتك",
    text: "من الصفحة الرئيسية اضغط بطاقة PUBG Mobile أو Free Fire أو الاشتراك الذي تريده مباشرة.",
  },
  {
    icon: MousePointerClick,
    title: "حدد العرض وبيانات التنفيذ",
    text: "اختر 60 أو 325 أو 660، ثم الخيار الفرعي إن وُجد وبيانات التنفيذ والكمية في صفحة الخدمة نفسها.",
  },
  {
    icon: ClipboardCheck,
    title: "انتقل إلى الدفع",
    text: "السلة أو اشتر الآن ينقلان إلى Checkout مستقل للدفع فقط بعد تثبيت كل اختياراتك.",
  },
];

export default async function HomePage() {
  const [{ banners, categories, popularProducts }, tickerMessages] = await Promise.all([
    getStorefrontHome(),
    getTickerMessages(),
  ]);
  const visibleCategories = categories.filter((category) => category.subcategories.length > 0);

  return (
    <main className={styles.home}>
      <StoreHeader />
      <BannerSlider banners={banners} />
      <StoreTicker messages={tickerMessages} />

      {popularProducts.length > 0 && (
        <section className={styles.popularSection} id="most-purchased" aria-labelledby="most-purchased-title">
          <div className="container">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>من الطلبات المكتملة</span>
                <h2 id="most-purchased-title">الأكثر شراءً</h2>
              </div>
              <p>ترتيب فعلي يعتمد على المبيعات المكتملة فقط. إذا لم توجد بيانات كافية لا نعرض نتائج وهمية.</p>
            </div>
            <div className={styles.popularGrid}>
              {popularProducts.map((product, index) => (
                <Link className={styles.popularCard} href={`/products/${product.slug}`} key={product.id}>
                  <div className={styles.popularMedia}>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt="" fill sizes="(max-width: 680px) 50vw, 280px" />
                    ) : (
                      <Boxes aria-hidden="true" size={34} />
                    )}
                    <span className={styles.rank}>#{index + 1}</span>
                  </div>
                  <small className={styles.cardMeta}>{product.subcategoryName || "RAIZEY STORE"}</small>
                  <h3>{product.name}</h3>
                  <span className={styles.cardAction}>فتح الخدمة <ChevronLeft aria-hidden="true" size={16} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.catalogSection} id="catalog" aria-labelledby="catalog-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>كتالوج RAIZEY</span>
              <h2 id="catalog-title">اختر خدمتك</h2>
            </div>
            <p>الأقسام تظهر كعناوين فقط، وتحت كل قسم بطاقات الخدمات مباشرة. الضغط على البطاقة يقود إلى صفحة الخدمة بدون طبقة تصنيفات إضافية.</p>
          </div>

          {visibleCategories.length === 0 ? (
            <div className={styles.emptyState}>
              <Boxes aria-hidden="true" size={30} />
              <div>
                <h3>الكتالوج قيد التجهيز</h3>
                <p>ستظهر الخدمات هنا تلقائيًا بعد نشرها من لوحة الإدارة.</p>
              </div>
            </div>
          ) : (
            <div className={styles.categoryList}>
              {visibleCategories.map((category) => (
                <section className={styles.categoryBlock} aria-labelledby={`category-${category.id}`} key={category.id}>
                  <div className={styles.categoryHead}>
                    <div>
                      <h3 id={`category-${category.id}`}>{category.name}</h3>
                      {category.description && <p>{category.description}</p>}
                    </div>
                  </div>

                  <div className={styles.categoryGrid}>
                    {category.subcategories.map((subcategory) => (
                      <Link
                        className={styles.categoryCard}
                        href={`/catalog/${subcategory.slug}`}
                        aria-label={`فتح ${subcategory.name}`}
                        key={subcategory.id}
                      >
                        <div className={styles.categoryMedia}>
                          {subcategory.imageUrl ? (
                            <Image src={subcategory.imageUrl} alt="" fill sizes="(max-width: 680px) 50vw, 280px" />
                          ) : (
                            <Layers3 aria-hidden="true" size={31} />
                          )}
                        </div>
                        <div className={styles.categoryCardBody}>
                          <small className={styles.cardMeta}>{category.name}</small>
                          <h3>{subcategory.name}</h3>
                          {subcategory.description && <p>{subcategory.description}</p>}
                          <ChevronLeft className={styles.categoryArrow} aria-hidden="true" size={18} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section} id="why-us" aria-labelledby="why-us-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>RAIZEY STANDARD</span>
              <h2 id="why-us-title">واجهة بسيطة، قواعد صارمة في الخلفية</h2>
            </div>
            <p>سهولة الشراء لا تعني تخفيف التحقق من السعر أو ملكية الحساب أو حالة الدفع.</p>
          </div>
          <div className={styles.infoGrid}>
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className={styles.infoCard} key={benefit.title}>
                  <span className={styles.iconBox}><Icon aria-hidden="true" size={21} /></span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.catalogSection} id="how-it-works" aria-labelledby="how-it-works-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>3 خطوات واضحة</span>
              <h2 id="how-it-works-title">من الخدمة إلى الدفع بدون لف ودوران</h2>
            </div>
            <p>بيانات التنفيذ مكانها صفحة الخدمة، بينما Checkout يبقى مخصصًا للدفع فقط.</p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className={styles.stepCard} key={step.title}>
                  <span className={styles.stepNumber}><Icon aria-hidden="true" size={20} /></span>
                  <span className={styles.stepLabel}>0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`container ${styles.ctaBand}`}>
          <div>
            <span className={styles.eyebrow}>RAIZEY STORE</span>
            <h2>جاهز تختار خدمتك؟</h2>
            <p>ابدأ من بطاقات الخدمات، أو افتح حسابك لمتابعة طلباتك الحالية.</p>
          </div>
          <div className={styles.ctaActions}>
            <Link className={styles.primaryAction} href="#catalog">تصفح الخدمات</Link>
            <Link className={styles.secondaryAction} href="/account">فتح حسابي</Link>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}
