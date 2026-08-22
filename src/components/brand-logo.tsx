type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <span
      className={`brand-lockup ${compact ? "brand-lockup--compact" : ""} ${className}`.trim()}
      role="img"
      aria-label="RAIZEY STORE"
    >
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 72 58" focusable="false">
          <path d="M7 8h37c12 0 20 7 20 17 0 9-6 15-15 17l13 12H46L28 38v-9h16c4 0 7-2 7-6s-3-6-7-6H19l-12-9Z" />
          <path d="M7 22h16l22 32H29L7 31v-9Z" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <strong>RAIZEY</strong>
          <small>STORE</small>
        </span>
      )}
    </span>
  );
}
