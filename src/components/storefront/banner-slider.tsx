"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StorefrontBanner } from "@/src/lib/catalog/storefront";

type BannerSliderProps = {
  banners: StorefrontBanner[];
};

export function BannerSlider({ banners }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const multiple = banners.length > 1;

  useEffect(() => {
    if (!multiple || paused) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 6500);

    return () => window.clearTimeout(timer);
  }, [activeIndex, banners.length, multiple, paused]);

  if (!banners.length) {
    return (
      <section className="store-hero" aria-labelledby="store-hero-title">
        <div className="container store-hero-inner">
          <div className="store-hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> خدمات رقمية موثوقة
            </span>
            <h1 id="store-hero-title">
              اختر خدمتك.<br />
              <span>والباقي علينا.</span>
            </h1>
            <p>
              كتالوج مرتب وأسعار واضحة وتجربة مصممة للموبايل أولًا.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="#catalog">
                استعرض الكتالوج
              </Link>
              <Link className="btn btn-secondary" href="/account">
                متابعة طلباتي
              </Link>
            </div>
          </div>
          <div className="store-hero-signal" aria-hidden="true">
            <span>RAIZEY</span>
            <strong>STORE</strong>
            <small>سريع · واضح · آمن</small>
          </div>
        </div>
      </section>
    );
  }

  const showPrevious = () => {
    setPaused(true);
    setActiveIndex((current) =>
      current === 0 ? banners.length - 1 : current - 1,
    );
  };
  const showNext = () => {
    setPaused(true);
    setActiveIndex((current) => (current + 1) % banners.length);
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
        if (start === null || end === undefined || Math.abs(end - start) < 45) {
          return;
        }
        if (end > start) showPrevious();
        else showNext();
      }}
    >
      <div className="container banner-stage">
        {banners.map((banner, index) => {
          const active = index === activeIndex;
          return (
            <article
              className={`banner-slide${active ? " is-active" : ""}`}
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
              <div className="banner-overlay" />
              <div className="banner-content">
                <span className="banner-kicker">عرض مميز</span>
                <h1>{banner.title}</h1>
                {banner.subtitle && <p>{banner.subtitle}</p>}
                {banner.linkUrl && (
                  <Link
                    className="btn btn-primary"
                    href={banner.linkUrl}
                    tabIndex={active ? undefined : -1}
                  >
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
              {banners.map((banner, index) => (
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
              {paused ? (
                <Play aria-hidden="true" size={18} />
              ) : (
                <Pause aria-hidden="true" size={18} />
              )}
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
