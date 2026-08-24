"use client";

import { useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { ChevronDownIcon, WhatsAppIcon } from "@/src/components/auth/auth-icons";

function countryFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const displayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["ar"], { type: "region" })
    : null;

type CountryPhoneInputProps = {
  /** Prefix for the generated element ids so the field can appear on more than one page. */
  idPrefix?: string;
  /** Existing E.164 value, used by /complete-profile to prefill a saved number. */
  defaultValue?: string;
};

/** Splits a stored E.164 number back into a country + national part. */
function initialState(defaultValue?: string) {
  const parsed = defaultValue ? parsePhoneNumberFromString(defaultValue) : undefined;
  if (parsed?.country && parsed.isValid()) {
    return { country: parsed.country as CountryCode, national: parsed.nationalNumber };
  }
  return { country: "SD" as CountryCode, national: "" };
}

export function CountryPhoneInput({
  idPrefix = "register",
  defaultValue,
}: CountryPhoneInputProps = {}) {
  const initial = useMemo(() => initialState(defaultValue), [defaultValue]);
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [nationalNumber, setNationalNumber] = useState(initial.national);
  const phoneId = `${idPrefix}-phone`;
  const countryId = `${idPrefix}-country`;
  const helpId = `${idPrefix}-phone-help`;

  const countries = useMemo(() => {
    return getCountries()
      .map((code) => ({
        code,
        name: displayNames?.of(code) ?? code,
        callingCode: getCountryCallingCode(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, []);

  const parsed = nationalNumber
    ? parsePhoneNumberFromString(nationalNumber, country)
    : undefined;
  const validPhone = Boolean(parsed?.isValid());
  // E.164 is what the server receives; an invalid draft submits empty so the
  // server-side validator rejects it rather than storing a malformed number.
  const e164 = validPhone ? parsed!.number : "";
  const isValid = !nationalNumber || validPhone;
  const callingCode = getCountryCallingCode(country);
  const selectedName = displayNames?.of(country) ?? country;

  return (
    <div className="field">
      <label className="field-label" htmlFor={phoneId}>
        رقم واتساب
      </label>

      <div className={`phone-input-shell${isValid ? "" : " auth-input-shell--error"}`}>
        <input type="hidden" name="phone" value={e164} />

        <div className="country-selector-wrap">
          <span className="country-flag" aria-hidden="true">
            {countryFlag(country)}
          </span>
          <span className="country-code" dir="ltr">
            +{callingCode}
          </span>
          <ChevronDownIcon className="country-chevron" aria-hidden="true" />
          <select
            id={countryId}
            className="country-selector"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value as CountryCode);
              setNationalNumber("");
            }}
            aria-label={`الدولة ورمز الاتصال، المحدد حاليًا ${selectedName} +${callingCode}`}
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {countryFlag(item.code)} {item.name} (+{item.callingCode})
              </option>
            ))}
          </select>
        </div>

        <input
          id={phoneId}
          className="phone-national-input"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel-national"
          value={nationalNumber}
          onChange={(event) => {
            const value = event.target.value.replace(/[^0-9\s()-]/g, "").slice(0, 24);
            setNationalNumber(value);
          }}
          placeholder="09XXXXXXXX"
          dir="ltr"
          aria-invalid={!isValid}
          aria-describedby={helpId}
        />

        <span className="phone-input-badge" aria-hidden="true">
          <WhatsAppIcon />
        </span>
      </div>

      <small id={helpId} className={isValid ? "field-help" : "field-error"}>
        {isValid
          ? "السودان (+249) هو الاختيار الافتراضي. يمكنك اختيار أي دولة وسيتم التحقق من الرقم حسب نظامها المحلي."
          : "رقم واتساب غير صالح لهذه الدولة. تحقق من الرقم ثم حاول مرة أخرى."}
      </small>
    </div>
  );
}

export default CountryPhoneInput;
