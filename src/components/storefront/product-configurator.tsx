"use client";

import { Check, LockKeyhole, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import type {
  StorefrontInputField,
  StorefrontVariant,
} from "@/src/lib/catalog/storefront";

type ProductConfiguratorProps = {
  productName: string;
  baseCustomerPrice: number;
  currency: string;
  variants: StorefrontVariant[];
  inputFields: StorefrontInputField[];
  suboptionsRequired: boolean;
};

function formatPrice(value: number, currency: string) {
  return `${new Intl.NumberFormat("ar-SD", {
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

export function ProductConfigurator({
  productName,
  baseCustomerPrice,
  currency,
  variants,
  inputFields,
  suboptionsRequired,
}: ProductConfiguratorProps) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [suboptionId, setSuboptionId] = useState("");
  const selectedVariant =
    variants.find((variant) => variant.id === variantId) ?? null;
  const selectedSuboption = selectedVariant?.suboptions.find(
    (suboption) => suboption.id === suboptionId,
  );
  const displayedPrice =
    selectedSuboption?.customerPrice ??
    selectedVariant?.customerPrice ??
    baseCustomerPrice;
  const needsSuboption = suboptionsRequired;
  const selectionReady = !needsSuboption || Boolean(selectedSuboption);

  return (
    <div className="product-configurator">
      <div className="product-price-card" aria-live="polite">
        <span>السعر الحالي</span>
        <strong>{formatPrice(displayedPrice, currency)}</strong>
        <small>
          السعر يتبدل فورًا حسب آخر خيار محدد، ويُعاد احتسابه من السيرفر عند
          الدفع.
        </small>
      </div>

      {variants.length > 0 && (
        <fieldset className="product-choice-group">
          <legend>اختر الباقة</legend>
          <div className="product-choice-grid">
            {variants.map((variant) => (
              <label
                className={`product-choice${variant.id === variantId ? " is-selected" : ""}`}
                key={variant.id}
              >
                <input
                  type="radio"
                  name="catalogVariant"
                  value={variant.id}
                  checked={variant.id === variantId}
                  onChange={() => {
                    setVariantId(variant.id);
                    setSuboptionId("");
                  }}
                />
                <span>
                  <strong>{variant.name}</strong>
                  <small>{formatPrice(variant.customerPrice, currency)}</small>
                </span>
                {variant.id === variantId && (
                  <Check aria-hidden="true" size={18} strokeWidth={2.5} />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {selectedVariant && selectedVariant.suboptions.length > 0 && (
        <fieldset className="product-choice-group">
          <legend>
            اختر الخيار الفرعي {needsSuboption && <span>مطلوب</span>}
          </legend>
          <div className="product-choice-grid">
            {selectedVariant.suboptions.map((suboption) => (
              <label
                className={`product-choice${suboption.id === suboptionId ? " is-selected" : ""}`}
                key={suboption.id}
              >
                <input
                  type="radio"
                  name="catalogSuboption"
                  value={suboption.id}
                  checked={suboption.id === suboptionId}
                  onChange={() => setSuboptionId(suboption.id)}
                  required={needsSuboption}
                />
                <span>
                  <strong>{suboption.name}</strong>
                  <small>{formatPrice(suboption.customerPrice, currency)}</small>
                </span>
                {suboption.id === suboptionId && (
                  <Check aria-hidden="true" size={18} strokeWidth={2.5} />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {inputFields.length > 0 && (
        <fieldset className="product-input-preview">
          <legend>بيانات العميل المطلوبة</legend>
          <div className="product-input-grid">
            {inputFields.map((field) => (
              <label className="field" key={field.id}>
                <span className="field-label">
                  {field.label}
                  {field.required && <span className="required-mark">مطلوب</span>}
                </span>
                <input
                  type={field.inputType}
                  name={field.fieldKey}
                  placeholder={field.placeholder ?? undefined}
                  required={field.required}
                  minLength={field.minLength ?? undefined}
                  maxLength={field.maxLength ?? undefined}
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!selectionReady && (
        <p className="configurator-warning" role="status">
          اختر الخيار الفرعي المطلوب قبل المتابعة.
        </p>
      )}

      <div className="product-purchase-actions" aria-label="خيارات الشراء القادمة">
        <button className="btn btn-primary" type="button" disabled>
          <ShoppingCart aria-hidden="true" size={18} />
          إضافة إلى السلة
        </button>
        <button className="btn btn-secondary" type="button" disabled>
          <Zap aria-hidden="true" size={18} />
          شراء الآن
        </button>
      </div>
      <div className="phase-note">
        <LockKeyhole aria-hidden="true" size={17} />
        <span>
          اختيار {productName} جاهز. تفعيل السلة والشراء الآمن سيتم ضمن مرحلة
          Cart &amp; Checkout بدون إنشاء طلب مالي من المتصفح.
        </span>
      </div>
    </div>
  );
}
