import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BrandLogo } from "@/src/components/brand-logo";
import { AdminNav } from "@/src/components/admin/admin-nav";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-frame">
      <header className="admin-topbar">
        <div className="container admin-topbar-main">
          <Link href="/admin" aria-label="RAIZEY STORE لوحة الإدارة">
            <BrandLogo compact />
          </Link>

          <div className="admin-topbar-actions">
            <span className="admin-mode-badge">
              <span className="admin-mode-dot" aria-hidden="true" />
              ADMIN CONTROL
            </span>
            <Link className="admin-store-link" href="/" target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" size={16} strokeWidth={2} />
              <span>عرض المتجر</span>
            </Link>
          </div>
        </div>
        <AdminNav />
      </header>

      {children}
    </div>
  );
}
