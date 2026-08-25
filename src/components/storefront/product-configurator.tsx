"use client";

import { Check, Info, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addCartItem } from "@/app/cart/actions";
import styles from "@/src/components/storefront/product-configurator.module.css";
import type {
  CatalogSuboptionV2,
  CatalogVariantV2,
} from "@/src/lib/catalog/product-detail-v2";

type ProductConfiguratorProps = {
  productId: string;
  productSlug: string;
  productName: string;
  baseCustomerPrice: number;
  currency: string;
  variants: CatalogVariantV2[];
  directSuboptions: CatalogSuboptionV2[];
  globalSuboptions: CatalogSuboptionV2[];
  baseSuboptionsRequired: boolean;
  inputFieldCount: number;
};

const PRODUCT_BASE = "__product_base__";

function formatPrice(value: number, currency: string) {
  const unit = currency === "SDG" ? "ج.س" : currency;
  return `${new Intl.NumberFormat("ar-SD", { maximumFractionDigits: 2 }).format(value)} ${unit}`;
}

export function ProductConfigurator({
  productId,
  productSlug,
  productName,
  baseCustomerPrice,
  currency,
  variants,
  directSuboptions,
  globalSuboptions,
  baseSuboptionsRequired,
  inputFieldCount,
}: ProductConfiguratorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasBasePath = variants.length === 0 || directSuboptions.length > 0;
  const initialChoice = variants[0]?.id ?? PRODUCT_BASE;
  const [variantId, setVariantId] = useState(initialChoice);
  const [suboptionId, setSuboptionId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const isBasePath = variantId === PRODUCT_BASE;
  const selectedVariant = isBasePath
    ? null
    : variants.find((variant) => variant.id === variantId) ?? null;
  const specificSuboptions = isBasePath ? directSuboptions : selectedVariant?.suboptions ?? [];
  const availableSuboptions = useMemo(
    () => [...specificSuboptions, ...globalSuboptions],
    [specificSuboptions, globalSuboptions],
  );
  const selectedSuboption = availableSuboptions.find((suboption) => suboption.id === suboptionId) ?? null;
  const baseUnitPrice = selectedVariant?.customerPrice ?? baseCustomerPrice;
  const unitPrice = selectedSuboption
    ? selectedSuboption.priceMode === "delta"
      ? baseUnitPrice + selectedSuboption.customerPrice
      : selectedSuboption.customerPrice
    : baseUnitPrice;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const needsSuboption = selectedVariant?.suboptionsRequired ?? baseSuboptionsRequired;
  const selectionReady = Boolean(selectedVariant || isBasePath) && (!needsSuboption || Boolean(selectedSuboption));
  const showBasePath = hasBasePath && (variants.length === 0 || directSuboptions.length > 0);

  function chooseMainOption(id: string) {
    setVariantId(id);
    setSuboptionId("");
    setStatus(null);
  }

  function selectionFormData() {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("variantId", isBasePath ? "" : variantId);
    formData.set("suboptionId", suboptionId);
    formData.set("quantity", String(quantity));
    return formData;
  }

  function addToCart() {
    if (!selectionReady || pending) return;
    setStatus(null);
    startTransition(async () => {
      const result = await addCartItem(selectionFormData());
      if (!result.ok) {
        if (result.reason === "login_required") {
          router.push(`/login?next=${encodeURIComponent(`/products/${productSlug}`)}`);
          return;
        }
        setStatus({ kind: "error", message: "تعذر إضافة الاختيار إلى السلة. حدّث الصفحة وحاول مرة أخرى." });
        return;
      }
      setStatus({ kind: "success", message: "تمت إضافة الاختيار إلى سلة المشتريات." });
      router.refresh();
    });
  }

  function buyNow() {
    if (!selectionReady || pending) return;
    const params = new URLSearchParams({
      mode: "buy",
      productId,
      quantity: String(quantity),
    });
    if (!isBasePath) params.set("variantId", variantId);
    if (suboptionId) params.set("suboptionId", suboptionId);
    router.push(`/checkout/catalog?${params.toString()}`);
  }

  return (
    <div className={styles.configurator}>
      <div className={styles.priceCard} aria-live="polite">
        <div className={styles.priceLabel}>
          <span>الإجمالي الحالي</span>
          <span>× {quantity.toLocaleString("ar")}</span>
        </div>
        <div className={styles.total}>
          <strong>{formatPrice(totalPrice, currency)}</strong>
          <small>للعدد المحدد</small>
        </div>
        {quantity > 1 && <div className={styles.unitPrice}>{formatPrice(unitPrice, currency)} للوحدة</div>}
      </div>

      {(variants.length > 0 || showBasePath) && (
        <fieldset className={styles.section}>
          <legend className={styles.legend}><span>اختر العرض</span><small>السعر يتحدث فورًا</small></legend>
          <div className={styles.choiceGrid}>
            {showBasePath && (
              <label className={`${styles.choice}${isBasePath ? ` ${styles.selected}` : ""}`}>
                <input
                  type="radio"
                  name="catalogVariant"
                  value={PRODUCT_BASE}
                  checked={isBasePath}
                  onChange={() => chooseMainOption(PRODUCT_BASE)}
                />
                <span className={styles.choiceText}>
                  <strong>{productName}</strong>
                  <small>{formatPrice(baseCustomerPrice, currency)}</small>
                </span>
                {isBasePath && <Check className={styles.check} aria-hidden="true" size={18} strokeWidth={2.5} />}
              </label>
            )}
            {variants.map((variant) => (
              <label className={`${styles.choice}${variant.id === variantId ? ` ${styles.selected}` : ""}`} key={variant.id}>
                <input
                  type="radio"
                  name="catalogVariant"
                  value={variant.id}
                  checked={variant.id === variantId}
                  onChange={() => chooseMainOption(variant.id)}
                />
                <span className={styles.choiceText}>
                  <strong>{variant.name}</strong>
                  <small>{formatPrice(variant.customerPrice, currency)}</small>
                </span>
                {variant.id === variantId && <Check className={styles.check} aria-hidden="true" size={18} strokeWidth={2.5} />}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {availableSuboptions.length > 0 && (
        <fieldset className={styles.section}>
          <legend className={styles.legend}>
            <span>اختر النوع</span>
            <small>{needsSuboption ? "مطلوب لهذا العرض" : "اختياري"}</small>
          </legend>
          <div className={styles.choiceGrid}>
            {availableSuboptions.map((suboption) => {
              const finalPrice = suboption.priceMode === "delta"
                ? baseUnitPrice + suboption.customerPrice
                : suboption.customerPrice;
              return (
                <label className={`${styles.choice}${suboption.id === suboptionId ? ` ${styles.selected}` : ""}`} key={suboption.id}>
                  <input
                    type="radio"
                    name="catalogSuboption"
                    value={suboption.id}
                    checked={suboption.id === suboptionId}
                    onChange={() => {
                      setSuboptionId(suboption.id);
                      setStatus(null);
                    }}
                  />
                  <span className={styles.choiceText}>
                    <strong>{suboption.name}</strong>
                    <small>{formatPrice(finalPrice, currency)}</small>
                    {suboption.appliesToAllVariants && <small className={styles.globalTag}>متاح لكل العروض</small>}
                  </span>
                  {suboption.id === suboptionId && <Check className={styles.check} aria-hidden="true" size={18} strokeWidth={2.5} />}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className={styles.quantityRow}>
        <div className={styles.quantityLabel}>
          <strong>الكمية</strong>
          <small>من 1 إلى 100</small>
        </div>
        <div className={styles.counter} aria-label="تحديد الكمية">
          <button type="button" aria-label="تقليل الكمية" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
            <Minus aria-hidden="true" size={17} />
          </button>
          <strong aria-live="polite">{quantity.toLocaleString("ar")}</strong>
          <button type="button" aria-label="زيادة الكمية" disabled={quantity >= 100} onClick={() => setQuantity((value) => Math.min(100, value + 1))}>
            <Plus aria-hidden="true" size={17} />
          </button>
        </div>
      </div>

      {inputFieldCount > 0 && (
        <div className={styles.dataNote}>
          <Info aria-hidden="true" size={16} />
          <span>بيانات التنفيذ المطلوبة تُكتب في خطوة الدفع بعد تثبيت العرض والكمية.</span>
        </div>
      )}

      {!selectionReady && (
        <p className={styles.warning} role="status">اختر النوع المطلوب لهذا العرض قبل المتابعة.</p>
      )}
      {status && <p className={status.kind === "success" ? styles.success : styles.error} role="status">{status.message}</p>}

      <div className={styles.actions} aria-label="إجراءات الشراء">
        <button className="btn btn-secondary" type="button" disabled={!selectionReady || pending} onClick={addToCart}>
          <ShoppingCart aria-hidden="true" size={18} />
          {pending ? "جارٍ الإضافة..." : "إضافة إلى السلة"}
        </button>
        <button className="btn btn-primary" type="button" disabled={!selectionReady || pending} onClick={buyNow}>
          <Zap aria-hidden="true" size={18} />
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}
