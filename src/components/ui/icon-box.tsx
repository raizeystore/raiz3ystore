import type { LucideIcon } from "lucide-react";

type IconTone = "brand" | "success" | "warning" | "danger";

type IconBoxProps = {
  icon: LucideIcon;
  size?: 16 | 18 | 20 | 24 | 32;
  tone?: IconTone;
  className?: string;
};

export function IconBox({ icon: Icon, size = 24, tone = "brand", className }: IconBoxProps) {
  const classes = [
    "icon-box",
    tone === "brand" ? "" : `icon-box--${tone}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-hidden="true">
      <Icon size={size} strokeWidth={2} aria-hidden="true" focusable="false" />
    </div>
  );
}
