"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  House,
  LayoutGrid,
  LogIn,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import styles from "@/src/components/storefront/store-header.module.css";
import { BrandLogo } from "@/src/components/brand-logo";

const mainLinks = [
  { href: "/", label: "الرئيسية", icon: House },
  { href: "/#catalog", label: "الكتالوج", icon: LayoutGrid },
  { href: "/search", label: "البحث عن المنتجات", icon: Search },
  { href: "/orders", label: "طلباتي", icon: ShoppingBag },
] as const;

const accountLinks = [
  { href: "/account", label: "حسابي", icon: UserRound },
  { href: "/account/security", label: "إعدادات وأمان الحساب", icon: ShieldCheck },
  { href: "/login", label: "تسجيل الدخول", icon: LogIn },
] as const;

export function StoreHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return `${styles.link}${active ? ` ${styles.linkActive}` : ""}`;
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <button className={styles.iconButton} type="button" aria-label="فتح القائمة" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu aria-hidden="true" size={22} />
        </button>

        <Link className={styles.logo} href="/" aria-label="RAIZEY STORE الرئيسية">
          <BrandLogo size="sm" />
        </Link>

        <Link className={styles.searchButton} href="/search" aria-label="البحث عن المنتجات">
          <Search aria-hidden="true" size={20} />
        </Link>
      </div>

      {open && (
        <>
          <button className={styles.backdrop} type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} />
          <aside className={styles.panel} aria-label="قائمة التنقل">
            <div className={styles.panelHead}>
              <BrandLogo size="sm" />
              <button className={styles.closeButton} type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)}>
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <form className={styles.searchForm} action="/search" method="get">
              <input className={styles.searchInput} name="q" minLength={2} maxLength={80} placeholder="ابحث عن منتج" aria-label="ابحث عن منتج" />
              <button className={styles.searchSubmit} type="submit" aria-label="بحث"><Search aria-hidden="true" size={19} /></button>
            </form>

            <nav className={styles.links} aria-label="التنقل الرئيسي">
              {mainLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={linkClass(item.href)} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                    <Icon aria-hidden="true" size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <span className={styles.groupTitle}>الحساب</span>
              {accountLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={linkClass(item.href)} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                    <Icon aria-hidden="true" size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </header>
  );
}
