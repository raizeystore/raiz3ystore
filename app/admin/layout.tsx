import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          borderBottom: "1px solid var(--border)",
          background: "rgba(8,8,8,.94)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div
          className="container"
          style={{
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <strong style={{ color: "var(--brand-strong)", marginInlineEnd: 6 }}>ADMIN</strong>
          <Link className="text-link" href="/admin">الرئيسية</Link>
          <Link className="text-link" href="/admin/catalog">إدارة الكتالوج</Link>
          <Link className="text-link" href="/admin/products">المنتجات والتسعير</Link>
          <Link className="text-link" href="/admin/orders">تنفيذ الطلبات</Link>
          <Link className="text-link" href="/account">حسابي</Link>
        </div>
      </div>
      {children}
    </>
  );
}
