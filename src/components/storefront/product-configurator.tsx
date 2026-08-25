"use client";

import { Check, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import type {
  StorefrontInputField,
  StorefrontSuboption,
  StorefrontVariant,
} from "@/src/lib/catalog/storefront";

type ProductConfiguratorProps = {
  productName: string;
  baseCustomerPrice: number;
  currency: string;
  variants: StorefrontVariant[];
  directSuboptions: StorefrontSuboption[];
  inputFields: StorefrontInputField[];
  suboptionsRequired: boolean;
};

const PRODUCT_BASE = "__product_base__";

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
  directSuboptions,
  inputFields,
  suboptionsRequired,
}: ProductConfiguratorProps) {
  const hasBasePath = directSuboptions.length > 0;
  const initialChoice = variants[0]?.id ?? (hasBasePath ? PRODUCT_BASE : "");
  const [variantId, setVariantId] = useState(initialChoice);
  const [suboptionId, setSuboptionId] = useState("");

  const isBasePath = variantId === PRODUCT_BASE || (!variantId && hasBasePath);
  const selectedVariant = isBasePath
    ? null
    : variants.find((variant) => variant.id === variantId) ?? null;
  const availableSuboptions = isBasePath
    ? directSuboptions
    : selectedVariant?.suboptions ?? [];
  const selectedSuboption = availableSuboptions.find(
    (suboption) => suboption.id === suboptionId,
  );

  const displayedPrice =
    selectedSuboption?.customerPrice ??
    selectedVariant?.customerPrice ??
    baseCustomerPrice;
  const needsSuboption = suboptionsRequired;
  const selectionReady =
    !needsSuboption ||
    (availableSuboptions.length > 0 && Boolean(selectedSuboption));
  const showMainChoice = variants.length > 1 || (variants.length > 0 && hasBasePath);

  function chooseMainOption(id: string) {
    setVariantId(id);
    setSuboptionId("");
  }

  return (
    <div className="product-configurator">
      <div className="product-price-card" aria-live="polite">
        <span>السعر</span>
        <strong>{formatPrice(displayedPrice, currency)}</strong>
        <small>يتغير السعر تلقائيًا حسب اختيارك.</small>
      </div>

      {showMainChoice && (
        <fieldset className="product-choice-group">
          <legend>اختر العرض</legend>
          <div className="product-choice-grid">
            {hasBasePath && (
              <label className={`product-choice${isBasePath ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="catalogVariant"
                  value={PRODUCT_BASE}
                  checked={isBasePath}
                  onChange={() => chooseMainOption(PRODUCT_BASE)}
                />
                <span>
                  <strong>{productName}</strong>
                  <small>{formatPrice(baseCustomerPrice, currency)}</small>
                </span>
                {isBasePath && <Check aria-hidden="true" size={18} strokeWidth={2.5} />}
              </label>
            )}
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
                  onChange={() => chooseMainOption(variant.id)}
                />
                <span>
                  <strong>{variant.name}</strong>
                  <small>{formatPrice(variant.customerPrice, currency)}</small>
                </span>
                {variant.id === variantId && <Check aria-hidden="true" size={18} strokeWidth={2.5} />}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {availableSuboptions.length > 0 && (
        <fieldset className="product-choice-group">
          <legend>
            اختر النوع {needsSuboption && <span>مطلوب</span>}
          </legend>
          <div className="product-choice-grid">
            {availableSuboptions.map((suboption) => (
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
                {suboption.id === suboptionId && <Check aria-hidden="true" size={18} strokeWidth={2.5} />}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {inputFields.length > 0 && (
        <fieldset className="product-input-preview">
          <legend>بيانات الطلب</legend>
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
          اختر أحد الخيارات المتاحة للمتابعة.
        </p>
      )}

      <div className="product-purchase-actions" aria-label="إجراءات الشراء">
        <button className="btn btn-primary" type="button" disabled>
          <ShoppingCart aria-hidden="true" size={18} />
          إضافة إلى السلة
        </button>
        <button className="btn btn-secondary" type="button" disabled>
          <Zap aria-hidden="true" size={18} />
          شراء الآن
        </button>
      </div>
    </div>
  );
}
