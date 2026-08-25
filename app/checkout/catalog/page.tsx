import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { createCatalogOrder } from "@/app/checkout/catalog/actions";
import styles from "@/app/checkout/catalog/checkout.module.css";
import { StoreHeader } from "@/src/components/storefront/store-header";
import {
  getCartForUser,
  getCatalogInputFields,
  resolveCatalogSelection,
  type ResolvedCatalogSelection,
} from "@/src/lib/cart/catalog-cart";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatPrice(value: number, currency: string) {
  const unit = currency === "SDG" ? "ج.س" : currency;
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

function errorMessage(code?: string) {
  if (code === "required_input") return "أكمل بيانات التنفيذ المطلوبة قبل إنشاء الطلب.";
  if (code === "invalid_input_length" || code === "invalid_field") return "راجع بيانات التنفيذ؛ إحدى القيم غير مطابقة للشروط المطلوبة.";
  if (code === "selection_changed") return "تغيّر أحد العروض أو الأسعار. تمت إعادة قراءة البيانات؛ راجع الملخص قبل المتابعة.";
  if (code === "suboption_required") return "أحد العروض يحتاج خيارًا فرعيًا قبل المتابعة.";
  if (code === "rate_limited") return "تم إنشاء عدة طلبات خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.";
  if (code) return "تعذر إنشاء الطلب. راجع البيانات وطريقة الدفع ثم حاول مرة أخرى.";
  return null;
}

function lineKey(item: ResolvedCatalogSelection) {
  return item.cartItemId ?? "buy";
}

export default async function CatalogCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    productId?: string;
    variantId?: string;
    suboptionId?: string;
    quantity?: string;
    error?: string;
  }>;
}) {
  const query = await searchParams;
  const mode = query.mode === "cart" ? "cart" : "buy";
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const currentPath = mode === "cart"
    ? "/checkout/catalog?mode=cart"
    : `/checkout/catalog?mode=buy&productId=${encodeURIComponent(query.productId ?? "")}`;
  if (!userId) redirect(`/login?next=${encodeURIComponent(currentPath)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_active")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.is_active) redirect("/account?error=account_inactive");

  let items: ResolvedCatalogSelection[] = [];
  if (mode === "cart") {
    items = await getCartForUser(userId);
    if (!items.length) redirect("/cart");
    if (items.some((item) => !item.available)) redirect("/cart");
  } else {
    const productId = String(query.productId ?? "");
    const variantId = String(query.variantId ?? "");
    const suboptionId = String(query.suboptionId ?? "");
    const quantity = Number(query.quantity ?? "1");
    if (
      !UUID_RE.test(productId) ||
      (variantId && !UUID_RE.test(variantId)) ||
      (suboptionId && !UUID_RE.test(suboptionId)) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) redirect("/#catalog");

    const resolved = await resolveCatalogSelection({
      productId,
      variantId: variantId || null,
      suboptionId: suboptionId || null,
      quantity,
    });
    if (!resolved.available) redirect(resolved.productSlug ? `/products/${resolved.productSlug}` : "/#catalog");
    items = [resolved];
  }

  const [fields, paymentMethodsResult] = await Promise.all([
    getCatalogInputFields(items.map((item) => item.productId)),
    supabase
      .from("payment_methods")
      .select("id, name, account_label, account_identifier, instructions")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);
  const paymentMethods = paymentMethodsResult.data ?? [];
  const checkoutToken = crypto.randomUUID();
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const currency = items[0]?.currency ?? "SDG";
  const error = errorMessage(query.error);

  return (
    <main className="site-shell">
      <StoreHeader />
      <section className={styles.page}>
        <div className="container">
          <div className={styles.head}>
            <span className="eyebrow"><ShieldCheck aria-hidden="true" size={15} /> CHECKOUT آمن</span>
            <h1>راجع الطلب وأكمل البيانات</h1>
            <p>السعر النهائي لا يُؤخذ من المتصفح. عند الضغط على إنشاء الطلب يعيد السيرفر التحقق من المنتج والعرض والخيار وسعر الصرف وهامش الربح.</p>
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}

          <div className={styles.layout}>
            <form className={styles.formCard} action={createCatalogOrder}>
              <input type="hidden" name="mode" value={mode} />
              <input type="hidden" name="checkoutToken" value={checkoutToken} />
              {mode === "buy" && (
                <>
                  <input type="hidden" name="productId" value={items[0].productId} />
                  <input type="hidden" name="variantId" value={items[0].variantId ?? ""} />
                  <input type="hidden" name="suboptionId" value={items[0].suboptionId ?? ""} />
                  <input type="hidden" name="quantity" value={items[0].quantity} />
                </>
              )}

              <section className={styles.section}>
                <div className={styles.sectionHead}>
                  <div><h2>بيانات التنفيذ</h2><p>تظهر الحقول التي حددتها لهذا المنتج فقط.</p></div>
                </div>

                {items.map((item) => {
                  const itemFields = fields.filter((field) => field.productId === item.productId);
                  if (!itemFields.length) return null;
                  return (
                    <div className={styles.itemFields} key={lineKey(item)}>
                      <div className={styles.itemTitle}>
                        <strong>{item.productName}</strong>
                        {item.variantName && <span>{item.variantName}</span>}
                        {item.suboptionName && <span>{item.suboptionName}</span>}
                      </div>
                      <div className={styles.fields}>
                        {itemFields.map((field) => (
                          <label className="field" key={`${lineKey(item)}-${field.id}`}>
                            <span className="field-label">{field.label}{field.required ? " *" : " (اختياري)"}</span>
                            <input
                              name={`input_${lineKey(item)}_${field.fieldKey}`}
                              type={field.inputType}
                              required={field.required}
                              minLength={field.minLength ?? undefined}
                              maxLength={field.maxLength ?? undefined}
                              placeholder={field.placeholder ?? undefined}
                              autoComplete="off"
                              inputMode={field.inputType === "number" ? "numeric" : undefined}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {fields.length === 0 && <p className="admin-muted">لا توجد بيانات إضافية مطلوبة لهذه الخدمات.</p>}
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHead}>
                  <div><h2>طريقة الدفع</h2><p>اختر وسيلة الدفع التي ستستخدمها لهذا الطلب.</p></div>
                  <CreditCard aria-hidden="true" size={20} />
                </div>
                <label className="field">
                  <span className="field-label">طريقة الدفع *</span>
                  <select className={styles.select} name="paymentMethodId" required defaultValue="">
                    <option value="" disabled>اختر طريقة الدفع</option>
                    {paymentMethods.map((method) => <option value={method.id} key={method.id}>{method.name}</option>)}
                  </select>
                </label>
                {paymentMethods.length > 0 && (
                  <div className={styles.itemFields} style={{ marginTop: 12 }}>
                    {paymentMethods.map((method) => (
                      <div className={styles.itemTitle} key={method.id} style={{ marginBottom: 7 }}>
                        <strong>{method.name}</strong>
                        {method.account_label && <span>{method.account_label}</span>}
                        {method.account_identifier && <span>{method.account_identifier}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <label className="field">
                  <span className="field-label">ملاحظة للطلب (اختياري)</span>
                  <textarea className={styles.textarea} name="customerNote" maxLength={500} rows={4} placeholder="أي تفاصيل إضافية يحتاجها التنفيذ" />
                </label>
              </section>

              <div className={styles.actions}>
                <button className="btn btn-primary" type="submit" disabled={!paymentMethods.length}>إنشاء الطلب والمتابعة للدفع</button>
                <Link className="btn btn-secondary" href={mode === "cart" ? "/cart" : `/products/${items[0].productSlug}`}>رجوع</Link>
              </div>
            </form>

            <aside className={styles.summary} aria-label="ملخص الطلب">
              <h2>ملخص الطلب</h2>
              <div className={styles.lines}>
                {items.map((item) => (
                  <div className={styles.line} key={lineKey(item)}>
                    <div className={styles.lineTop}>
                      <strong>{item.productName}</strong>
                      <span>{formatPrice(item.totalPrice, item.currency)}</span>
                    </div>
                    <div className={styles.lineMeta}>
                      {item.variantName && <span>{item.variantName}</span>}
                      {item.suboptionName && <span>· {item.suboptionName}</span>}
                      <span>· الكمية {item.quantity.toLocaleString("ar")}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.total}><span>الإجمالي الحالي</span><strong>{formatPrice(total, currency)}</strong></div>
              <div className={styles.security}>
                <ShieldCheck aria-hidden="true" size={15} />
                <span>يُعاد حساب هذا الإجمالي من قاعدة البيانات عند إنشاء الطلب، لذلك لا يعتمد النظام على السعر الظاهر في المتصفح.</span>
              </div>
              <div className={styles.security}>
                <ShieldCheck aria-hidden="true" size={15} />
                <span>الحساب: {profile.display_name || "مستخدم RAIZEY"}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
