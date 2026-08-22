import { expect, test } from "@playwright/test";

test("home page renders the mobile-first storefront entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /قوة اللعب/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "ابدأ الشحن الآن" })).toHaveAttribute("href", "/games");
  await expect(page.getByRole("link", { name: "دخول", exact: true })).toHaveAttribute("href", "/login");
});

test("login page exposes sign-in and account creation controls", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "مرحبًا بعودتك" })).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور")).toBeVisible();
  await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  await expect(page.getByRole("button", { name: "إنشاء حساب جديد" })).toBeVisible();
});

test("protected account route sends anonymous visitors to login", async ({ page }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "مرحبًا بعودتك" })).toBeVisible();
});
