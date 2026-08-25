"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Headphones,
  Pause,
  Play,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StorefrontBanner } from "@/src/lib/catalog/storefront";

type BannerSliderProps = {
  banners: StorefrontBanner[];
};

const BUILTIN_BANNERS: StorefrontBanner[] = [
  {
    id: "builtin-catalog",
    title: "خدماتك الرقمية في مكان واحد",
    subtitle: "اختر القسم ثم الباقة والمنتج، والأسعار تُحسب بالسعر المعتمد في المتجر.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "#catalog",
    buttonText: "استعرض الكتالوج",
  },
  {
    id: "builtin-wallet",
    title: "محفظة واحدة لطلباتك القادمة",
    subtitle: "رصيد حسابك أصبح له بنية مستقلة، وشحن المحفظة سيُفعّل ضمن المرحلة المالية القادمة.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "/wallet",
    buttonText: "عرض المحفظة",
  },
  {
    id: "builtin-support",
    title: "كل تحديث في طلبك يصل إلى حسابك",
    subtitle: "راجع التنبيهات وحالة الطلب من داخل RAIZEY، مع سبب الرفض عند وجوده.",
    desktopImage: null,
    mobileImage: null,
    linkUrl: "/notifications",
    buttonText: "فتح الإشعارات",
  },
];

function bannerIcon(id: string) {
  if (id === "builtin-wallet") return WalletCards;
  if (id === "builtin-support") return Headphones;
  return Gamepad2;
}

export function BannerSlider({ banners }: BannerSliderProps) {
  const slides = banners.length >= 3
    ? banners
    : [...banners, ...BUILTIN_BANNERS.filter((item) => !banners.some((banner) => banner.id === item.id))].slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const multiple = slides.length > 1;

  useEffect(() => {
    if (!multiple || paused) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, multiple, paused, slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  const showPrevious = () => {
    setPaused(true);
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const showNext = () => {
    setPaused(true);
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className="banner-slider"
      aria-roledescription="carousel"
      aria-label="عروض RAIZEY STORE"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        touchStart.current = null;
        if (start === null || end === undefined || Math.abs(end - start) < 45) return;
        if (end > start) showPrevious();
        else showNext();
      }}
    >
      <div className="container banner-stage">
        {slides.map((banner, index) => {
          const active = index === activeIndex;
          const GraphicIcon = bannerIcon(banner.id);
          const hasImage = Boolean(banner.desktopImage || banner.mobileImage);

          return (
            <article
              className={`banner-slide${active ? " is-active" : ""}${hasImage ? " has-image" : " is-built-in"}`}
              aria-hidden={!active}
              key={banner.id}
            >
              {banner.desktopImage && (
                <Image
                  className="banner-image banner-image--desktop"
                  src={banner.desktopImage}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1200px) 100vw, 1180px"
                />
              )}
              {(banner.mobileImage || banner.desktopImage) && (
                <Image
                  className="banner-image banner-image--mobile"
                  src={banner.mobileImage || banner.desktopImage!}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                />
              )}

              {!hasImage && (
                <div className="banner-graphic" aria-hidden="true">
                  <span className="banner-graphic-orbit" />
                  <span className="banner-graphic-icon"><GraphicIcon size={68} strokeWidth={1.35} /></span>
                  <strong>RAIZEY</strong>
                </div>
              )}

              <div className="banner-overlay" />
              <div className="banner-content">
                <span className="banner-kicker">{banner.id.startsWith("builtin-") ? "RAIZEY STORE" : "عرض مميز"}</span>
                <h1>{banner.title}</h1>
                {banner.subtitle && <p>{banner.subtitle}</p>}
                {banner.linkUrl && (
                  <Link className="btn btn-primary" href={banner.linkUrl} tabIndex={active ? undefined : -1}>
                    {banner.buttonText || "اكتشف العرض"}
                  </Link>
                )}
              </div>
            </article>
          );
        })}

        {multiple && (
          <div className="banner-controls">
            <button type="button" onClick={showPrevious} aria-label="البنر السابق">
              <ChevronRight aria-hidden="true" size={20} />
            </button>
            <div className="banner-dots" aria-label="اختيار البنر">
              {slides.map((banner, index) => (
                <button
                  className={index === activeIndex ? "is-active" : ""}
                  type="button"
                  aria-label={`عرض البنر ${index + 1}: ${banner.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => {
                    setPaused(true);
                    setActiveIndex(index);
                  }}
                  key={banner.id}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "تشغيل البنرات تلقائيًا" : "إيقاف البنرات مؤقتًا"}
            >
              {paused ? <Play aria-hidden="true" size={18} /> : <Pause aria-hidden="true" size={18} />}
            </button>
            <button type="button" onClick={showNext} aria-label="البنر التالي">
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
