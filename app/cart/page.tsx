import Image from "next/image";
import Link from "next/link";
import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { removeCartItem, setCartItemQuantity } from "@/app/cart/actions";
import styles from "@/app/cart/cart.module.css";
import { StoreFooter } from "@/src/components/storefront/store-footer";
import { StoreHeader } from "@/src/components/storefront/store-header";
import { getCartForUser } from "@/src/lib/cart/catalog-cart";
import { createClient } from "@/src/lib/supabase/server";

function formatPrice(value: number, currency: string) {
  const unit = currency === "SDG" ? "ج.س" : currency;
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

export default async function CartPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login?next=%2Fcart");

  const items = await getCartForUser(userId);
  const availableItems = items.filter((item) => item.available);
  const unavailableCount = items.length - availableItems.length;
  const quantity = availableItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = availableItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const currency = availableItems[0]?.currency ?? "SDG";

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className={styles.page}>
        <div className="container">
          <div className={styles.head}>
            <div>
              <span className="eyebrow"><ShoppingCart aria-hidden="true" size={15} /> سلة RAIZEY</span>
              <h1>سلة المشتريات</h1>
              <p>الأسعار هنا للعرض فقط، ويتم التحقق منها مرة أخرى من قاعدة البيانات عند إنشاء الطلب.</p>
            </div>
            <Link className="btn btn-secondary" href="/#catalog">إضافة خدمات أخرى</Link>
          </div>

          {!items.length ? (
            <div className={styles.empty}>
              <div>
                <ShoppingCart aria-hidden="true" size={38} />
                <h2>السلة فارغة</h2>
                <p>اختر المنتج ثم العرض والكمية، واضغط إضافة إلى السلة.</p>
                <Link className="btn btn-primary" href="/#catalog">تصفح الكتالوج</Link>
              </div>
            </div>
          ) : (
            <div className={styles.layout}>
              <div className={styles.items}>
                {items.map((item) => (
                  <article className={styles.item} key={item.cartItemId}>
                    <Link className={styles.media} href={item.productSlug ? `/products/${item.productSlug}` : "/#catalog"}>
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill sizes="100px" />
                      ) : (
                        <Package aria-hidden="true" size={30} />
                      )}
                    </Link>
                    <div className={styles.info}>
                      <small>{item.available ? "متاح الآن" : "يحتاج مراجعة"}</small>
                      <h2>{item.productName}</h2>
                      <div className={styles.meta}>
                        {item.variantName && <span>{item.variantName}</span>}
                        {item.suboptionName && <span>{item.suboptionName}</span>}
                        {!item.available && <span>الخيار لم يعد متاحًا</span>}
                      </div>
                      {item.available && (
                        <div className={styles.linePrice}>
                          <strong>{formatPrice(item.totalPrice, item.currency)}</strong>
                          {item.quantity > 1 && <span> · {formatPrice(item.unitPrice, item.currency)} للوحدة</span>}
                        </div>
                      )}
                    </div>
                    <div className={styles.controls}>
                      {item.available && item.cartItemId && (
                        <div className={styles.quantity} aria-label={`كمية ${item.productName}`}>
                          <form action={setCartItemQuantity}>
                            <input type="hidden" name="cartItemId" value={item.cartItemId} />
                            <input type="hidden" name="quantity" value={Math.max(1, item.quantity - 1)} />
                            <button type="submit" aria-label="تقليل الكمية" disabled={item.quantity <= 1}><Minus size={16} /></button>
                          </form>
                          <strong>{item.quantity.toLocaleString("ar")}</strong>
                          <form action={setCartItemQuantity}>
                            <input type="hidden" name="cartItemId" value={item.cartItemId} />
                            <input type="hidden" name="quantity" value={Math.min(100, item.quantity + 1)} />
                            <button type="submit" aria-label="زيادة الكمية" disabled={item.quantity >= 100}><Plus size={16} /></button>
                          </form>
                        </div>
                      )}
                      {item.cartItemId && (
                        <form action={removeCartItem}>
                          <input type="hidden" name="cartItemId" value={item.cartItemId} />
                          <button className={styles.remove} type="submit"><Trash2 aria-hidden="true" size={14} /> إزالة</button>
                        </form>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <aside className={styles.summary} aria-label="ملخص السلة">
                <h2>ملخص السلة</h2>
                <div className={styles.summaryRow}><span>عدد العناصر</span><strong>{quantity.toLocaleString("ar")}</strong></div>
                <div className={styles.summaryRow}><span>الخيارات المختلفة</span><strong>{availableItems.length.toLocaleString("ar")}</strong></div>
                <div className={styles.summaryTotal}><span>الإجمالي الحالي</span><strong>{formatPrice(total, currency)}</strong></div>
                {unavailableCount > 0 && (
                  <div className={styles.warning}>احذف أو عدّل العناصر غير المتاحة قبل الانتقال للدفع.</div>
                )}
                {availableItems.length > 0 && unavailableCount === 0 && (
                  <Link className={`btn btn-primary ${styles.checkout}`} href="/checkout/catalog?mode=cart">
                    متابعة إلى الدفع
                  </Link>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
