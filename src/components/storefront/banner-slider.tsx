"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Layers3,
  Pause,
  Play,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "@/src/components/storefront/banner-slider.module.css";
import type { StorefrontBanner } from "@/src/lib/catalog/storefront";

type BannerSliderProps = {
  banners: StorefrontBanner[];
};

const BUILTIN_BANNERS: StorefrontBanner[] = [
  {
    id: "builtin-gaming",
    title: "شحنتك تبدأ من هنا",
    subtitle: "اختر لعبتك وباقتك، واستلم الشحن بسرعة وبخطوات واضحة.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "#catalog",
    buttonText: "تصفح الألعاب",
  },
  {
    id: "builtin-offers",
    title: "قيمة أكبر، تجربة أسهل",
    subtitle: "اكتشف الباقات الأكثر طلبًا والأسعار المحدثة من مصدر المتجر.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "#catalog",
    buttonText: "شاهد العروض",
  },
  {
    id: "builtin-subscriptions",
    title: "اشتراكاتك في مكان واحد",
    subtitle: "اختر الخدمة المناسبة وأكمل طلبك بطريقة سريعة وآمنة.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "#catalog",
    buttonText: "تصفح الاشتراكات",
  },
  {
    id: "builtin-wallet",
    title: "ادفع بالطريقة التي تناسبك",
    subtitle: "محفظة، رمز دفع، أو تحويل بنكي مع متابعة واضحة لكل طلب.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "/wallet",
    buttonText: "تعرّف على طرق الدفع",
  },
];

function bannerLabel(id: string) {
  if (id === "builtin-gaming") return "RAIZEY GAMING";
  if (id === "builtin-offers") return "عروض مختارة";
  if (id === "builtin-subscriptions") return "RAIZEY SUBSCRIPTIONS";
  if (id === "builtin-wallet") return "دفع أسهل";
  return "عرض مميز";
}

function bannerIcon(id: string) {
  if (id === "builtin-offers") return BadgePercent;
  if (id === "builtin-subscriptions") return Layers3;
  if (id === "builtin-wallet") return WalletCards;
  return Gamepad2;
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const mergedSlides = [
    ...banners,
    ...BUILTIN_BANNERS.filter((fallback) => !banners.some((banner) => banner.id === fallback.id)),
  ];
  const slides = (banners.length >= 4 ? banners : mergedSlides).slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const multiple = slides.length > 1;
  const visibleIndex = activeIndex % slides.length;

  useEffect(() => {
    if (!multiple || manualPaused || interactionPaused) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [activeIndex, interactionPaused, manualPaused, multiple, slides.length]);

  const showPrevious = () => {
    setActiveIndex((current) => {
      const safeCurrent = current % slides.length;
      return safeCurrent === 0 ? slides.length - 1 : safeCurrent - 1;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className={styles.slider}
      aria-roledescription="carousel"
      aria-label="إعلانات المتجر"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={() => setInteractionPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
        setInteractionPaused(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        touchStart.current = null;

        if (start !== null && end !== undefined && Math.abs(end - start) >= 45) {
          if (end > start) showPrevious();
          else showNext();
        }
        setInteractionPaused(false);
      }}
      onTouchCancel={() => {
        touchStart.current = null;
        setInteractionPaused(false);
      }}
    >
      <div className={`container ${styles.stage}`}>
        {slides.map((banner, index) => {
          const active = index === visibleIndex;
          const GraphicIcon = bannerIcon(banner.id);
          const hasImage = Boolean(banner.desktopImage || banner.mobileImage);

          return (
            <article
              className={`${styles.slide}${active ? ` ${styles.active}` : ""}${hasImage ? ` ${styles.withImage}` : ` ${styles.builtIn}`}`}
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${index + 1} من ${slides.length}`}
              key={banner.id}
            >
              {banner.desktopImage && (
                <Image
                  className={`${styles.image} ${styles.desktopImage}`}
                  src={banner.desktopImage}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1200px) 100vw, 1180px"
                />
              )}
              {(banner.mobileImage || banner.desktopImage) && (
                <Image
                  className={`${styles.image} ${styles.mobileImage}`}
                  src={banner.mobileImage || banner.desktopImage!}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                />
              )}

              {!hasImage && (
                <div className={styles.graphic} aria-hidden="true">
                  <span className={styles.orbit} />
                  <span className={styles.icon}><GraphicIcon size={58} strokeWidth={1.45} /></span>
                  <strong className={styles.wordmark}>RAIZEY</strong>
                </div>
              )}

              <div className={styles.overlay} />
              <div className={styles.content}>
                <span className={styles.kicker}>{bannerLabel(banner.id)}</span>
                <h1>{banner.title}</h1>
                {banner.subtitle && <p>{banner.subtitle}</p>}
                {banner.linkUrl && (
                  <Link className={styles.cta} href={banner.linkUrl} tabIndex={active ? undefined : -1}>
                    {banner.buttonText || "اكتشف العرض"}
                    <ChevronLeft aria-hidden="true" size={17} />
                  </Link>
                )}
              </div>
            </article>
          );
        })}

        {multiple && (
          <div className={styles.controls} aria-label="التحكم في البنر">
            <button type="button" onClick={showPrevious} aria-label="البنر السابق">
              <ChevronRight aria-hidden="true" size={19} />
            </button>
            <div className={styles.dots} aria-label="اختيار البنر">
              {slides.map((banner, index) => (
                <button
                  className={index === visibleIndex ? styles.activeDot : undefined}
                  type="button"
                  aria-label={`عرض البنر ${index + 1}: ${banner.title}`}
                  aria-current={index === visibleIndex ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                  key={banner.id}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setManualPaused((value) => !value)}
              aria-label={manualPaused ? "تشغيل البنرات تلقائيًا" : "إيقاف البنرات مؤقتًا"}
            >
              {manualPaused ? <Play aria-hidden="true" size={17} /> : <Pause aria-hidden="true" size={17} />}
            </button>
            <button type="button" onClick={showNext} aria-label="البنر التالي">
              <ChevronLeft aria-hidden="true" size={19} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
