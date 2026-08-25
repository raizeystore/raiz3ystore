import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, ReceiptText, WalletCards } from "lucide-react";
import styles from "@/app/wallet/wallet.module.css";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { getStoreHeaderContext } from "@/src/lib/storefront/shell";

export const dynamic = "force-dynamic";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("ar-SD", { maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);
}

export default async function WalletPage() {
  const context = await getStoreHeaderContext();
  if (!context.signedIn) redirect("/login?message=login_required&next=/wallet");

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className={styles.page}>
        <div className="container">
          <div className={styles.head}>
            <span className="eyebrow"><WalletCards aria-hidden="true" size={15} /> محفظة RAIZEY</span>
            <h1>المحفظة</h1>
            <p>رصيدك محفوظ في حسابك وسيكون مصدر الدفع الداخلي عند تفعيل الشحن المالي.</p>
          </div>

          <div className={styles.balanceCard}>
            <div className={styles.balanceTop}>
              <span>الرصيد المتاح</span>
              <span className={styles.balanceIcon}><WalletCards aria-hidden="true" size={22} /></span>
            </div>
            <div className={styles.amount}>
              <strong>{formatAmount(context.walletBalance)}</strong>
              <small>{context.walletCurrency === "SDG" ? "ج.س" : context.walletCurrency}</small>
            </div>
          </div>

          <div className={styles.grid}>
            <article className={styles.panel}>
              <h2>شحن المحفظة</h2>
              <p>واجهة طلب شحن الرصيد ومراجعة الإيصال ستُبنى في المرحلة المالية التالية. البنية الحالية تحفظ الرصيد لكل حساب بصورة منفصلة وآمنة.</p>
              <span className={styles.comingSoon}><Clock3 aria-hidden="true" size={14} /> قيد التنفيذ في المرحلة القادمة</span>
            </article>
            <article className={styles.panel}>
              <h2>سجل الرصيد</h2>
              <p>سنضيف دفتر حركات مستقل لكل إضافة أو خصم حتى يكون كل تغيير قابلًا للمراجعة.</p>
              <div style={{ marginTop: 14 }}>
                <Link className="btn btn-secondary" href="/orders"><ReceiptText aria-hidden="true" size={17} /> طلباتي الحالية</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
