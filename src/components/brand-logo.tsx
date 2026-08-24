import Image from "next/image";
import type { CSSProperties } from "react";

type BrandLogoVariant = "full" | "compact" | "footer";

type BrandLogoProps = {
  /** Visual scale of the official asset. */
  size?: "sm" | "md" | "lg";
  /** Legacy compatibility: false renders the official compact R mark only. */
  withWordmark?: boolean;
  /** Legacy compatibility for constrained navbar/header spaces. */
  compact?: boolean;
  /** Explicit official asset variant. */
  variant?: BrandLogoVariant;
  className?: string;
  style?: CSSProperties;
  /** Use only when the same visible RAIZEY STORE name is already adjacent. */
  decorative?: boolean;
};

const FULL_DIMENSIONS = {
  sm: { width: 126, height: 36 },
  md: { width: 154, height: 44 },
  lg: { width: 210, height: 60 },
} as const;

const COMPACT_DIMENSIONS = {
  sm: { width: 39, height: 34 },
  md: { width: 51, height: 44 },
  lg: { width: 69, height: 60 },
} as const;

/**
 * Single source of truth for the RAIZEY STORE brand across the product.
 *
 * IMPORTANT: This component renders only the brand-owner supplied official
 * raster assets from /public/brand. It must never redraw the R mark, recreate
 * the wordmark with text/CSS, mirror the lockup for RTL, or substitute a
 * Lucide/general-purpose icon.
 */
export function BrandLogo({
  size,
  withWordmark = true,
  compact = false,
  variant,
  className,
  style,
  decorative = false,
}: BrandLogoProps) {
  const resolvedVariant: BrandLogoVariant =
    variant ?? (compact || !withWordmark ? "compact" : "full");
  const resolvedSize = size ?? (resolvedVariant === "footer" ? "sm" : compact ? "sm" : "md");
  const isCompact = resolvedVariant === "compact";
  const dimensions = isCompact ? COMPACT_DIMENSIONS[resolvedSize] : FULL_DIMENSIONS[resolvedSize];
  const src = isCompact
    ? "/brand/raizey-store-mark.png"
    : "/brand/raizey-store-logo.png";
  const classes = [
    "brand-lockup",
    `brand-lockup--${resolvedSize}`,
    `brand-lockup--${resolvedVariant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        direction: "ltr",
        lineHeight: 0,
        maxWidth: "100%",
        flexShrink: 0,
        filter: "none",
        ...style,
      }}
    >
      <Image
        src={src}
        alt={decorative ? "" : "RAIZEY STORE"}
        aria-hidden={decorative ? "true" : undefined}
        width={dimensions.width}
        height={dimensions.height}
        sizes={isCompact ? `${dimensions.width}px` : `(max-width: 480px) ${dimensions.width}px, ${dimensions.width}px`}
        priority={resolvedVariant === "full" && resolvedSize === "lg"}
        style={{
          display: "block",
          width: "auto",
          maxWidth: "100%",
          height: `${dimensions.height}px`,
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </span>
  );
}

export const OfficialBrandLogo = BrandLogo;
export default BrandLogo;
