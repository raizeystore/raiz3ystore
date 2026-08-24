import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

type IconTone = "brand" | "success" | "warning" | "danger";

type IconBoxProps = {
  icon: LucideIcon;
  size?: 16 | 18 | 20 | 24 | 32;
  tone?: IconTone;
  className?: string;
};

const toneStyles: Record<IconTone, CSSProperties | undefined> = {
  brand: undefined,
  success: { color: "var(--success)", background: "rgba(63, 207, 142, 0.12)" },
  warning: { color: "var(--warning)", background: "rgba(246, 183, 60, 0.12)" },
  danger: { color: "var(--danger)", background: "rgba(240, 91, 97, 0.12)" },
};

export function IconBox({ icon: Icon, size = 24, tone = "brand", className }: IconBoxProps) {
  const classes = ["icon-box", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={classes} style={toneStyles[tone]} aria-hidden="true">
      <Icon size={size} strokeWidth={2} aria-hidden="true" focusable="false" />
    </div>
  );
}
