import { expect, test } from "@playwright/test";

test("OTP resend button starts locked with a visible countdown", async ({ page, context }) => {
  const url = "http://127.0.0.1:3000";
  await context.addCookies([
    {
      name: "raizey_pending_email",
      value: "user@example.com",
      url,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "raizey_pending_purpose",
      value: "signup",
      url,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "raizey_otp_sent_at",
      value: String(Date.now()),
      url,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/verify-code");

  const resend = page.getByRole("button", { name: /إعادة الإرسال خلال/ });
  await expect(resend).toBeVisible();
  await expect(resend).toBeDisabled();
  await expect(page.getByText(/يمكنك طلب رمز جديد بعد \d+ ثانية/)).toBeVisible();
  await expect(resend).toContainText(/00:(5\d|60)/);
});
