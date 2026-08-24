import type { CSSProperties } from "react";

type BrandLogoProps = {
  /** Visual scale of the lockup. */
  size?: "sm" | "md" | "lg";
  /** Renders the wordmark next to the glyph. */
  withWordmark?: boolean;
  /** Shared navbar/header variant. */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Official RAIZEY STORE brand lockup.
 *
 * The R mark below is vectorized from the approved user-supplied logo and is
 * intentionally kept inline so it stays sharp at every density. Every page
 * uses this single component so the brand cannot drift between auth/store UI.
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
        <svg viewBox="0 0 391 327" focusable="false" aria-hidden="true">
          <path d="M0 0L53 72H227L238 75L246 80L256 92L261 107L259 127L252 139L246 145L238 150L228 153L165 154L301 327H391L294 201L311 184L326 159L333 138L336 115L335 95L328 67L314 42L297 24L270 8L237 0Z" />
          <path d="M3 153L143 327H232L96 153Z" />
        </svg>
      </span>

      {withWordmark ? (
        <span className="brand-wordmark" aria-hidden="true">
          <strong>RAIZEY</strong>
          <small style={{ color: "var(--brand)" }}>STORE</small>
        </span>
      ) : null}
    </span>
  );
}

export default BrandLogo;
