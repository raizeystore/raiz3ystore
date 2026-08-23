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

const displayNames = typeof Intl !== "undefined" && "DisplayNames" in Intl
  ? new Intl.DisplayNames(["ar"], { type: "region" })
  : null;

export function CountryPhoneInput() {
  const [country, setCountry] = useState<CountryCode>("SD");
  const [nationalNumber, setNationalNumber] = useState("");

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
  const e164 = validPhone ? parsed!.number : "";
  const isValid = !nationalNumber || validPhone;
  const callingCode = getCountryCallingCode(country);

  return (
    <div className="field auth-grid-span">
      <label className="field-label" htmlFor="register-phone">رقم واتساب</label>
      <div className={`phone-input-shell ${isValid ? "" : "auth-input-shell--error"}`.trim()}>
        <span className="auth-input-icon auth-input-icon--phone" aria-hidden="true">
          <WhatsAppIcon />
        </span>

        <input type="hidden" name="phone" value={e164} />

        <div className="country-selector-wrap">
          <span className="country-flag" aria-hidden="true">{countryFlag(country)}</span>
          <span className="country-code" dir="ltr">+{callingCode}</span>
          <ChevronDownIcon className="country-chevron" />
          <select
            className="country-selector"
            value={country}
            onChange={(event) => {
              setCountry(event.target.value as CountryCode);
              setNationalNumber("");
            }}
            aria-label="الدولة ورمز الاتصال"
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {countryFlag(item.code)} {item.name} (+{item.callingCode})
              </option>
            ))}
          </select>
        </div>

        <input
          id="register-phone"
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
          aria-describedby="register-phone-help"
        />
      </div>
      <small id="register-phone-help" className={isValid ? "field-help" : "field-error"}>
        {isValid
          ? "السودان (+249) هو الاختيار الافتراضي. يمكنك اختيار أي دولة وسيتم التحقق من الرقم حسب نظامها المحلي."
          : "رقم واتساب غير صالح لهذه الدولة. تحقق من الرقم ثم حاول مرة أخرى."}
      </small>
    </div>
  );
}
