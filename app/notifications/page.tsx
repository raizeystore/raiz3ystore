import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, CheckCheck, CircleAlert, ShieldCheck, ShoppingBag } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/notifications/actions";
import styles from "@/app/notifications/notifications.module.css";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

function notificationLabel(type: string) {
  if (type === "admin_order") return "تنبيه إدارة";
  if (type === "order_status") return "تحديث طلب";
  return "تنبيه حساب";
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "admin_order") return <ShieldCheck aria-hidden="true" size={21} />;
  if (type === "order_status") return <ShoppingBag aria-hidden="true" size={21} />;
  return <CircleAlert aria-hidden="true" size={21} />;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/login?message=login_required&next=/notifications");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, type, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const items = notifications ?? [];
  const unreadCount = items.filter((item) => !item.read_at).length;

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className={styles.page}>
        <div className="container">
          <div className={styles.head}>
            <div>
              <span className="eyebrow"><BellRing aria-hidden="true" size={15} /> مركز التنبيهات</span>
              <h1>الإشعارات</h1>
              <p>{unreadCount ? `لديك ${unreadCount.toLocaleString("ar-SD")} إشعار غير مقروء.` : "لا توجد إشعارات جديدة الآن."}</p>
            </div>
            <div className={styles.actions}>
              {unreadCount > 0 && (
                <form action={markAllNotificationsRead}>
                  <button className="btn btn-secondary" type="submit"><CheckCheck aria-hidden="true" size={17} /> تعليم الكل كمقروء</button>
                </form>
              )}
              <Link className="btn btn-secondary" href="/orders">طلباتي</Link>
            </div>
          </div>

          {items.length === 0 ? (
            <div className={styles.empty}>
              <BellRing aria-hidden="true" size={30} />
              <strong>صندوق الإشعارات هادئ</strong>
              <span>ستظهر هنا تحديثات الطلبات والتنبيهات المرتبطة بحسابك.</span>
            </div>
          ) : (
            <div className={styles.list}>
              {items.map((item) => (
                <article className={`${styles.card}${item.read_at ? "" : ` ${styles.unread}`}`} key={item.id}>
                  <span className={styles.icon}><NotificationIcon type={item.type} /></span>
                  <div className={styles.copy}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                    <div className={styles.meta}>
                      <span>{notificationLabel(item.type)}</span>
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    {!item.read_at && (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="notificationId" value={item.id} />
                        <button className={styles.readButton} type="submit">تمت القراءة</button>
                      </form>
                    )}
                    <Link className={styles.contextLink} href={item.type === "admin_order" ? "/admin/orders" : "/orders"}>
                      {item.type === "admin_order" ? "فتح الطلبات" : "عرض طلباتي"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
