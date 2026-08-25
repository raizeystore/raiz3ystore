import Link from "next/link";
import { Boxes, Layers3, Package, PanelsTopLeft } from "lucide-react";

const items = [
  { href: "/admin/catalog", label: "ملخص الكتالوج", icon: PanelsTopLeft },
  { href: "/admin/catalog/categories", label: "الأقسام", icon: Layers3 },
  { href: "/admin/catalog/subcategories", label: "التصنيفات", icon: Boxes },
  { href: "/admin/catalog/products", label: "المنتجات", icon: Package },
] as const;

export function CatalogNav() {
  return (
    <nav className="catalog-admin-nav" aria-label="أقسام إدارة الكتالوج">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link href={item.href} key={item.href}>
            <Icon aria-hidden="true" size={17} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
