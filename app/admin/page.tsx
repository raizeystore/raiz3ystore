import Link from "next/link";
import {
  Activity,
  Boxes,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  Settings,
  ShoppingBag,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const admin = createAdminClient();

  const [usersRes, productsRes, ordersRes, paymentsRes, pendingPaymentsRes, activeOrdersRes, pendingOrdersRes] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("payments").select("*", { count: "exact", head: true }),
    admin.from("payments").select("*", { count: "exact", head: true }).eq("status", "under_review"),
    admin.from("orders").select("*", { count: "exact", head: true }).in("status", ["paid", "processing"]),
    admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending_payment"),
  ]);

  const metrics = [
    { label: "الطلبات", value: ordersRes.count ?? 0, icon: ShoppingBag },
    { label: "المنتجات", value: productsRes.count ?? 0, icon: Boxes },
    { label: "العملاء", value: usersRes.count ?? 0, icon: UsersRound },
    { label: "المدفوعات", value: paymentsRes.count ?? 0, icon: CircleDollarSign },
  ];

  const tasks = [
    { label: "دفعات تحتاج مراجعة", hint: "إيصالات بانتظار قرار الإدارة", count: pendingPaymentsRes.count ?? 0, href: "/admin/orders", icon: WalletCards },
    { label: "طلبات تحتاج تنفيذ", hint: "طلبات مدفوعة أو قيد التنفيذ", count: activeOrdersRes.count ?? 0, href: "/admin/orders", icon: PackageCheck },
    { label: "طلبات بانتظار الدفع", hint: "طلبات لم يكتمل دفعها بعد", count: pendingOrdersRes.count ?? 0, href: "/admin/orders", icon: Clock3 },
  ];

  const quickLinks = [
    { href: "/admin/catalog", label: "الكتالوج", hint: "إدارة المحتوى الحالي", icon: Boxes },
    { href: "/admin/orders", label: "الطلبات", hint: "المراجعة والتنفيذ", icon: ShoppingBag },
    { href: "/admin/settings", label: "الإعدادات", hint: "سعر الصرف والربح", icon: Settings },
    { href: "/admin/audit", label: "سجل التدقيق", hint: "آخر العمليات الإدارية", icon: Activity },
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">ADMIN CONTROL CENTER</span>
            <h1>لوحة إدارة RAIZEY</h1>
            <p>{profile.display_name ? `مرحبًا ${profile.display_name}  ` : ""}نظرة سريعة على المتجر والمهام التي تحتاج إجراء بدون تكديس أدوات الإدارة في صفحة واحدة</p>
          </div>
        </div>

        <section className="admin-metrics" aria-label="إحصائيات المتجر">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="admin-metric-card" key={metric.label}>
                <div className="admin-metric-top">
                  <span>{metric.label}</span>
                  <span className="admin-metric-icon"><Icon aria-hidden="true" size={19} strokeWidth={2} /></span>
                </div>
                <strong>{metric.value.toLocaleString("ar")}</strong>
              </article>
            );
          })}
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>يحتاج انتباهك</h2>
                <p>المهام التشغيلية الأهم الآن</p>
              </div>
            </div>
            <div className="admin-task-list">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <Link className="admin-task-row" href={task.href} key={task.label}>
                    <div className="admin-task-main">
                      <span className="admin-task-icon"><Icon aria-hidden="true" size={19} strokeWidth={2} /></span>
                      <span className="admin-task-text"><strong>{task.label}</strong><span>{task.hint}</span></span>
                    </div>
                    <span className="admin-task-count">{task.count.toLocaleString("ar")}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>اختصارات</h2>
                <p>ادخل مباشرة للقسم المطلوب</p>
              </div>
            </div>
            <div className="admin-quick-grid">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className="admin-link-card" href={item.href} key={item.href}>
                    <span className="admin-link-icon"><Icon aria-hidden="true" size={19} strokeWidth={2} /></span>
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
