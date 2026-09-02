"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Gift,
  House,
  LogIn,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  WalletCards,
  X,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { BrandLogo } from "@/src/components/brand-logo";
import styles from "@/src/components/storefront/store-header.module.css";
import type { StoreHeaderContext } from "@/src/lib/storefront/shell";

type StoreHeaderClientProps = {
  context: StoreHeaderContext;
};

type DrawerItem = {
  label: string;
  href?: string;
  icon: typeof House;
  disabled?: boolean;
  adminOnly?: boolean;
  badge?: number;
};

function formatWalletAmount(amount: number, currency: string) {
  const formatted = new Intl.NumberFormat("ar-SD", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  const unit = currency === "SDG" ? "ج.س" : currency;
  return { formatted, unit };
}

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function StoreHeaderClient({ context }: StoreHeaderClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const wallet = formatWalletAmount(context.walletBalance, context.walletCurrency);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeClass = (href?: string) => {
    if (!href) return styles.link;
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return `${styles.link}${active ? ` ${styles.linkActive}` : ""}`;
  };

  const accountHref = (path: string) => (context.signedIn ? path : `/login?next=${encodeURIComponent(path)}`);
  const drawerItems: DrawerItem[] = [
    { label: "الرئيسية", href: "/", icon: House },
    { label: "سلة المشتريات", href: "/cart", icon: ShoppingCart, badge: context.cartItemCount },
    { label: "شحن المحفظة", href: "/wallet", icon: WalletCards },
    { label: "طلباتي", href: "/orders", icon: ShoppingBag },
    { label: "إحالاتي وأرباحي", icon: Gift, disabled: true },
    { label: "إعدادات الحساب", href: "/account", icon: Settings },
    { label: "لوحة الإدارة", href: "/admin", icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.rightTools} aria-label="القائمة والسلة">
          <button
            className={styles.iconButton}
            type="button"
            aria-label="فتح القائمة"
            aria-expanded={open}
            aria-controls="store-navigation-drawer"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" size={22} />
          </button>
          <Link
            className={styles.cartButton}
            href={accountHref("/cart")}
            aria-label={context.cartItemCount ? `سلة المشتريات، ${context.cartItemCount} عنصر` : "سلة المشتريات"}
          >
            <ShoppingCart aria-hidden="true" size={19} />
            {context.cartItemCount > 0 && <span className={styles.notificationBadge}>{countLabel(context.cartItemCount)}</span>}
          </Link>
        </div>

        <Link className={styles.logo} href="/" aria-label="RAIZEY STORE الرئيسية">
          <Image
            src="/brand/raizey-store-logo.png"
            alt="RAIZEY STORE"
            width={640}
            height={183}
            priority
            sizes="(max-width: 520px) 165px, 190px"
            className={styles.headerLogoImage}
          />
        </Link>

        <div className={styles.headerTools} aria-label="البحث والإشعارات والمحفظة">
          <Link className={styles.searchButton} href="/search" aria-label="البحث عن المنتجات">
            <Search aria-hidden="true" size={19} />
          </Link>

          <Link
            className={styles.notificationButton}
            href={accountHref("/notifications")}
            aria-label={context.unreadNotifications ? `الإشعارات، ${context.unreadNotifications} غير مقروء` : "الإشعارات"}
          >
            <Bell aria-hidden="true" size={19} />
            {context.unreadNotifications > 0 && <span className={styles.notificationBadge}>{countLabel(context.unreadNotifications)}</span>}
          </Link>

          <Link
            className={styles.walletChip}
            href={accountHref("/wallet")}
            aria-label={context.signedIn ? `رصيد المحفظة ${wallet.formatted} ${wallet.unit}` : "المحفظة"}
          >
            <WalletCards aria-hidden="true" size={16} />
            {context.signedIn ? (
              <span><strong>{wallet.formatted}</strong><small>{wallet.unit}</small></span>
            ) : (
              <span className={styles.walletGuest}>المحفظة</span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <>
          <button className={styles.backdrop} type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} />
          <aside
            className={styles.panel}
            id="store-navigation-drawer"
            aria-label="قائمة التنقل"
            aria-modal="true"
            role="dialog"
            ref={panelRef}
          >
            <div className={styles.panelHead}>
              <div>
                <BrandLogo size="sm" />
                {context.signedIn && (
                  <p className={styles.accountGreeting}>{context.displayName ? `مرحبًا، ${context.displayName}` : "حسابك في RAIZEY"}</p>
                )}
              </div>
              <button
                className={styles.closeButton}
                type="button"
                aria-label="إغلاق القائمة"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <nav className={styles.links} aria-label="التنقل الرئيسي">
              {drawerItems
                .filter((item) => !item.adminOnly || context.isAdmin)
                .map((item) => {
                  const Icon = item.icon;
                  if (item.disabled) {
                    return (
                      <span className={`${styles.link} ${styles.linkDisabled}`} aria-disabled="true" key={item.label}>
                        <Icon aria-hidden="true" size={20} />
                        <span>{item.label}</span>
                        <small>قريبًا</small>
                      </span>
                    );
                  }

                  const href = item.href && item.href !== "/" ? accountHref(item.href) : item.href!;
                  return (
                    <Link className={activeClass(item.href)} href={href} key={item.label} onClick={() => setOpen(false)}>
                      <Icon aria-hidden="true" size={20} />
                      <span>{item.label}</span>
                      {Boolean(item.badge) && <small className={styles.drawerBadge}>{countLabel(item.badge!)}</small>}
                    </Link>
                  );
                })}
            </nav>

            <div className={styles.drawerFooter}>
              {context.signedIn ? (
                <form action={signOut}>
                  <button className={styles.logoutButton} type="submit">
                    <LogOut aria-hidden="true" size={20} />
                    تسجيل الخروج
                  </button>
                </form>
              ) : (
                <Link className={styles.loginButton} href="/login" onClick={() => setOpen(false)}>
                  <LogIn aria-hidden="true" size={20} />
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
