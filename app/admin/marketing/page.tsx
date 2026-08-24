import { Gift, Megaphone, TicketPercent, UsersRound } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export default async function AdminMarketingPage() {
  await requireAdmin();

  const features = [
    { title: "الكوبونات", text: "خصومات بقيمة أو نسبة مع صلاحية وحدود استخدام وشروط واضحة", icon: TicketPercent },
    { title: "الإحالات", text: "أكواد إحالة ومكافآت تمنع التكرار وإحالة النفس", icon: UsersRound },
    { title: "العروض والبنرات", text: "إدارة عروض الصفحة الرئيسية والبنرات الموسمية من لوحة واحدة", icon: Megaphone },
    { title: "المكافآت", text: "طبقة مستقبلية للمكافآت المرتبطة بطلبات مكتملة", icon: Gift },
  ];

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page-head">
          <div className="admin-page-head-copy">
            <span className="admin-page-kicker">MARKETING</span>
            <h1>التسويق</h1>
            <p>هذا القسم أصبح منفصلًا من الآن حتى لا تختلط أدوات النمو والتسويق بإدارة الطلبات والكتالوج</p>
          </div>
        </div>

        <section className="admin-panel">
          <div className="admin-quick-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="admin-link-card" key={feature.title}>
                  <span className="admin-link-icon"><Icon aria-hidden="true" size={19} strokeWidth={2} /></span>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </article>
              );
            })}
          </div>
          <div className="admin-empty admin-section-gap"><strong>لم يتم تفعيل الجداول التسويقية الجديدة بعد</strong><span>سيتم تنفيذها بمigrations مستقلة بعد تثبيت Catalog V2 حتى تبقى عملية الرجوع آمنة</span></div>
        </section>
      </div>
    </main>
  );
}
