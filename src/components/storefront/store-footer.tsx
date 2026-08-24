import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";

export function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <BrandLogo variant="footer" />
        <nav className="footer-links" aria-label="روابط المتجر">
          <Link href="/privacy">الخصوصية</Link>
          <Link href="/terms">الشروط</Link>
          <Link href="/account">حسابي</Link>
        </nav>
        <span>© 2026 RAIZEY STORE — جميع الحقوق محفوظة.</span>
      </div>
    </footer>
  );
}
