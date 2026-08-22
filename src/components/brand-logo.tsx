type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""} ${className}`.trim()} aria-label="RAIZEY STORE">
      <span className="brand-mark" aria-hidden="true">R</span>
      {!compact && (
        <span className="brand-wordmark">
          <strong>RAIZEY</strong>
          <small>STORE</small>
        </span>
      )}
    </div>
  );
}
