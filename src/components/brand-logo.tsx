import type { CSSProperties } from "react";

type BrandLogoProps = {
  /** Visual scale of the lockup. */
  size?: "sm" | "md" | "lg";
  /** Renders the wordmark next to the glyph. */
  withWordmark?: boolean;
  /**
   * Navbar / header variant: smaller mark, tighter wordmark.
   * Equivalent to `size="sm"` and kept as a separate prop because it is the
   * shared header treatment used across the store.
   */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * RAIZEY STORE brand lockup.
 *
 * The mark is a single angular "R" built from straight cuts: an italic stem,
 * a notched bowl and a detached diagonal leg, matching the approved identity.
 * Rendered as inline SVG so it stays sharp at every density and can inherit
 * brand colour from CSS.
 */
export function BrandLogo({
  size,
  withWordmark = true,
  compact = false,
  className,
  style,
}: BrandLogoProps) {
  const resolvedSize = size ?? (compact ? "sm" : "md");
  const classes = [
    "brand-lockup",
    `brand-lockup--${resolvedSize}`,
    compact ? "brand-lockup--compact" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style} role="img" aria-label="RAIZEY STORE">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 124 104" focusable="false" aria-hidden="true">
          {/* Italic stem */}
          <path d="M14 0h30l-6 104H8L14 0Z" />
          {/* Notched bowl */}
          <path d="M40 0h44l24 24v17l-19 15H38l1.4-24h35l6-5v-8l-10-8H38.6L40 0Z" />
          {/* Detached diagonal leg */}
          <path d="M62 62h29l28 42H88L62 62Z" />
        </svg>
      </span>

      {withWordmark ? (
        <span className="brand-wordmark" aria-hidden="true">
          <strong>RAIZEY</strong>
          <small>STORE</small>
        </span>
      ) : null}
    </span>
  );
}

export default BrandLogo;
