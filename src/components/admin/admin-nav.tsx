"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Boxes,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UsersRound,
  WalletCards,
} from "lucide-react";

const items = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/admin/catalog", label: "الكتالوج", icon: Boxes },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/customers", label: "العملاء", icon: UsersRound },
  { href: "/admin/finance", label: "المالية", icon: WalletCards },
  { href: "/admin/marketing", label: "التسويق", icon: Megaphone },
  { href: "/admin/staff", label: "المشرفون", icon: ShieldCheck },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/audit", label: "السجل", icon: Activity },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="أقسام لوحة الإدارة">
      <div className="admin-nav-track">
        {items.map((item) => {
          const Icon = item.icon;
          const isExact = "exact" in item && item.exact === true;
          const active = isExact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
