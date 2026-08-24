"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { resendEmailCode } from "@/app/auth/actions";

export function ResendCodeButton({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(Math.max(0, Math.min(60, initialSeconds)));

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const waiting = seconds > 0;
  const clock = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <form action={resendEmailCode} style={{ display: "grid", gap: 8, marginTop: 2 }}>
      <button
        className="btn btn-secondary btn-full"
        type="submit"
        disabled={waiting}
        aria-describedby="otp-resend-status"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 50,
          opacity: waiting ? 0.62 : 1,
          cursor: waiting ? "not-allowed" : "pointer",
        }}
      >
        <RotateCw size={18} strokeWidth={2} aria-hidden="true" />
        <span>{waiting ? "إعادة الإرسال خلال" : "إعادة إرسال الرمز"}</span>
        {waiting ? <span dir="ltr" style={{ minWidth: 44, fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>{clock}</span> : null}
      </button>
      <p
        id="otp-resend-status"
        aria-live="polite"
        style={{ margin: 0, textAlign: "center", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.7 }}
      >
        {waiting ? `يمكنك طلب رمز جديد بعد ${seconds} ثانية` : "يمكنك الآن طلب رمز جديد"}
      </p>
    </form>
  );
}
