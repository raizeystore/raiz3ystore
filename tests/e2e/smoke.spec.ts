import { expect, test } from "@playwright/test";

test("home page renders the mobile-first storefront entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /قوة اللعب/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "ابدأ الشحن الآن" })).toHaveAttribute("href", "/games");
  await expect(page.getByRole("link", { name: "دخول", exact: true })).toHaveAttribute("href", "/login");
});

test("login page matches the premium gaming sign-in experience", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /مرحبًا بعودتك/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "RAIZEY STORE" })).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  await expect(page.getByRole("link", { name: "إنشاء حساب جديد" })).toHaveAttribute("href", "/register");
  await expect(page.getByRole("button", { name: "المتابعة عبر Google" })).toBeVisible();
  await expect(page.getByText("دخول آمن", { exact: true })).toBeVisible();
  await expect(page.getByText("تتبّع طلباتك", { exact: true })).toBeVisible();
  await expect(page.getByText("شحن فوري", { exact: true })).toBeVisible();
});

test("register page contains identity, international WhatsApp, password and policy controls", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "إنشاء حساب جديد" })).toBeVisible();
  await expect(page.getByRole("img", { name: "RAIZEY STORE" })).toBeVisible();
  await expect(page.getByLabel("الاسم الكامل")).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByLabel("رقم واتساب")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByLabel("تأكيد كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByText("قوة كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "التسجيل عبر Google" })).toBeVisible();
});

test("WhatsApp selector defaults to Sudan and switches country calling code", async ({ page }) => {
  await page.goto("/register");

  const country = page.getByLabel("الدولة ورمز الاتصال");
  await expect(country).toHaveValue("SD");
  await expect(page.getByText("+249", { exact: true })).toBeVisible();

  await country.selectOption("EG");
  await expect(country).toHaveValue("EG");
  await expect(page.getByText("+20", { exact: true })).toBeVisible();
});

test("register password meter reacts without submitting real auth requests", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("StrongPassword9!");
  await expect(page.getByText("قوية جدًا")).toBeVisible();
});

test("privacy and store terms are reachable before account creation", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "سياسة الخصوصية" })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "سياسة المتجر والشروط" })).toBeVisible();
});

test("protected account route sends anonymous visitors to login", async ({ page }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /مرحبًا بعودتك/ })).toBeVisible();
});
