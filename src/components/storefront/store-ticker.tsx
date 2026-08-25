import { Sparkles } from "lucide-react";
import styles from "@/src/components/storefront/store-ticker.module.css";

const DEFAULT_MESSAGES = [
  "الأسعار تُحدّث حسب سعر الصرف المعتمد في المتجر",
  "تابع حالة طلبك من صفحة طلباتي بدون الحاجة لمراسلة الدعم",
  "الدعم الفني متاح لمساعدتك عند وجود مشكلة في الطلب",
  "العروض والمنتجات الجديدة تظهر فور نشرها من إدارة المتجر",
];

type StoreTickerProps = {
  messages: string[];
};

export function StoreTicker({ messages }: StoreTickerProps) {
  const items = messages.length ? messages : DEFAULT_MESSAGES;

  const group = (hidden = false) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((message, index) => (
        <span className={styles.item} key={`${hidden ? "copy" : "main"}-${index}-${message}`}>
          <i aria-hidden="true" />
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <section className={styles.ticker} aria-label="إعلانات المتجر">
      <div className={styles.label}>
        <Sparkles aria-hidden="true" size={15} />
        <span>RAIZEY الآن</span>
      </div>
      <div className={styles.window}>
        <div className={styles.track}>
          {group()}
          {group(true)}
        </div>
      </div>
    </section>
  );
}
