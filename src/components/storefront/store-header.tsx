import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";
import { BrandLogo } from "@/src/components/brand-logo";

export function StoreHeader() {
  return (
    <header className="site-header">
      <div className="container navbar">
        <Link href="/" aria-label="RAIZEY STORE الرئيسية">
          <BrandLogo />
        </Link>

        <nav className="nav-links" aria-label="التنقل الرئيسي">
          <Link href="/#catalog">الكتالوج</Link>
          <Link href="/#why-us">لماذا RAIZEY</Link>
          <Link href="/#how-it-works">كيف تطلب</Link>
          <Link href="/orders">طلباتي</Link>
        </nav>

        <div className="nav-actions">
          <Link className="store-icon-link" href="/orders" aria-label="طلباتي">
            <ShoppingBag aria-hidden="true" size={19} strokeWidth={2} />
          </Link>
          <Link className="btn btn-primary store-login-link" href="/login" aria-label="دخول">
            <UserRound aria-hidden="true" size={18} strokeWidth={2} />
            <span>دخول</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
