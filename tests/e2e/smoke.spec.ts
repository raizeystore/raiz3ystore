import { expect, test } from "@playwright/test";

test("home page renders the mobile-first storefront entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /قوة اللعب/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "ابدأ الشحن الآن" })).toHaveAttribute("href", "/games");
  await expect(page.getByRole("link", { name: "دخول", exact: true })).toHaveAttribute("href", "/login");
});

test("login page exposes premium sign-in and Google controls", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /مرحبًا بعودتك/ })).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني", { exact: true })).toBeVisible();
  await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "تسجيل الدخول", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "المتابعة عبر Google", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "إنشاء حساب جديد", exact: true })).toHaveAttribute("href", "/register");
  await expect(page.getByRole("img", { name: "RAIZEY STORE", exact: true })).toBeVisible();
});

test("register page contains required identity, WhatsApp, password and policy controls", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "إنشاء حساب جديد", exact: true })).toBeVisible();
  await expect(page.getByLabel("الاسم الكامل", { exact: true })).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني", { exact: true })).toBeVisible();
  await expect(page.getByLabel("رقم واتساب", { exact: true })).toBeVisible();
  await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByLabel("تأكيد كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByText("قوة كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "التسجيل عبر Google", exact: true })).toBeVisible();
});

test("register password meter reacts without submitting real auth requests", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("StrongPass9!");
  await expect(page.getByText("قوية جدًا", { exact: true })).toBeVisible();
});

test("privacy and store terms are reachable before account creation", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "سياسة الخصوصية", exact: true })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "سياسة المتجر والشروط", exact: true })).toBeVisible();
});

test("protected account route sends anonymous visitors to login", async ({ page }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /مرحبًا بعودتك/ })).toBeVisible();
});
