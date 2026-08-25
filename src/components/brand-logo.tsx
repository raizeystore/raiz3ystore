import Image from "next/image";
import type { CSSProperties } from "react";

type BrandLogoVariant = "full" | "compact" | "footer";

type BrandLogoProps = {
  /** Visual scale of the official asset. */
  size?: "sm" | "md" | "lg";
  /** Kept for compatibility. The official full logo is always rendered. */
  withWordmark?: boolean;
  /** Kept for constrained headers. Changes scale only, never the asset. */
  compact?: boolean;
  /** Visual placement variant. All variants use the same official full logo. */
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

/**
 * Single source of truth for the RAIZEY STORE brand across the product.
 *
 * IMPORTANT: Every placement renders only /public/brand/raizey-store-logo.png.
 * The logo is never redrawn, mirrored for RTL, shortened to an R mark, or
 * replaced with a general-purpose icon.
 */
export function BrandLogo({
  size,
  compact = false,
  variant,
  className,
  style,
  decorative = false,
}: BrandLogoProps) {
  const resolvedVariant: BrandLogoVariant = variant ?? (compact ? "compact" : "full");
  const resolvedSize = size ?? (resolvedVariant === "footer" || compact ? "sm" : "md");
  const dimensions = FULL_DIMENSIONS[resolvedSize];
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
        src="/brand/raizey-store-logo.png"
        alt={decorative ? "" : "RAIZEY STORE"}
        aria-hidden={decorative ? "true" : undefined}
        width={dimensions.width}
        height={dimensions.height}
        sizes={`${dimensions.width}px`}
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
