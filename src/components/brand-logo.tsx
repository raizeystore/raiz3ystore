import type { CSSProperties } from "react";

type BrandLogoProps = {
  /** Visual scale of the lockup. */
  size?: "sm" | "md" | "lg";
  /** Renders the wordmark next to the glyph. */
  withWordmark?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * RAIZEY STORE brand lockup.
 *
 * The mark is a single angular "R" built from straight cuts: a vertical stem,
 * a notched bowl and a detached diagonal leg, matching the approved identity.
 * Rendered as inline SVG so it stays sharp at every density and can inherit
 * brand colour from CSS.
 */
export function BrandLogo({
  size = "md",
  withWordmark = true,
  className,
  style,
}: BrandLogoProps) {
  const classes = ["brand-lockup", `brand-lockup--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style} role="img" aria-label="RAIZEY STORE">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 120 100" focusable="false" aria-hidden="true">
          {/* Vertical stem */}
          <path d="M4 4h26v92H4z" />
          {/* Upper bowl with the angular notch */}
          <path d="M30 4h52l26 25v22l-20 15H30V64h44l8-6V33l-11-9H30z" />
          {/* Detached diagonal leg */}
          <path d="M62 72h30l24 24H86z" />
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
