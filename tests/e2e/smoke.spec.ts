import { expect, test } from "@playwright/test";

test("home page renders the mobile-first storefront shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "اختر خدمتك", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "تصفح الألعاب" })).toHaveAttribute("href", "#catalog");
  await expect(page.getByRole("link", { name: "البحث عن المنتجات" })).toHaveAttribute("href", "/search");
  await expect(page.getByRole("link", { name: "الإشعارات" })).toHaveAttribute("href", "/login?next=%2Fnotifications");
  await expect(page.getByRole("link", { name: "المحفظة" })).toHaveAttribute("href", "/login?next=%2Fwallet");
  await expect(page.getByRole("link", { name: "فتح حسابي" })).toHaveAttribute("href", "/login?next=%2Faccount");
  await expect(page.getByRole("link", { name: "سلة المشتريات" })).toHaveAttribute("href", "/login?next=%2Fcart");
  await expect(page.getByRole("region", { name: "إعلانات المتجر" })).toBeVisible();

  await page.getByRole("button", { name: "فتح القائمة" }).click();
  const drawer = page.getByRole("navigation", { name: "التنقل الرئيسي" });
  await expect(drawer.getByRole("link", { name: "سلة المشتريات", exact: true })).toHaveAttribute("href", "/login?next=%2Fcart");
  await expect(drawer.getByRole("link", { name: "شحن المحفظة", exact: true })).toHaveAttribute("href", "/login?next=%2Fwallet");
  await expect(drawer.getByRole("link", { name: "طلباتي", exact: true })).toHaveAttribute("href", "/login?next=%2Forders");
  await expect(drawer.getByText("إحالاتي وأرباحي", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("link", { name: "إعدادات الحساب" })).toHaveAttribute("href", "/login?next=%2Faccount");
  await expect(drawer.getByRole("link", { name: "لوحة الإدارة" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "تسجيل الدخول", exact: true })).toHaveAttribute("href", "/login");
  await expect(page.getByText(/PUBG MOBILE|FREE FIRE|CALL OF DUTY/)).toHaveCount(0);
});

test("home page has no horizontal overflow at the target 393px width", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("anonymous visitors cannot access Catalog V2 administration", async ({ page }) => {
  await page.goto("/admin/catalog/categories");
  await expect(page).toHaveURL(/\/login/);
});

test("wallet notifications and cart require an authenticated account", async ({ page }) => {
  await page.goto("/wallet");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/notifications");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/cart");
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/checkout/catalog?mode=cart");
  await expect(page).toHaveURL(/\/login/);
});

test("login page matches the premium gaming sign-in experience", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("img", { name: "RAIZEY STORE" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /مرحباً بعودتك/ })).toBeVisible();
  await expect(page.getByText("دخول آمن", { exact: true })).toBeVisible();
  await expect(page.getByText("تتبع طلباتك", { exact: true })).toBeVisible();
  await expect(page.getByText("شحن فوري", { exact: true })).toBeVisible();

  await expect(page.locator(".auth-premium-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "تسجيل الدخول", level: 2 })).toHaveCount(1);
  await expect(page.locator(".auth-security-note")).toHaveCount(1);

  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  const password = page.getByLabel("كلمة المرور", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  const toggle = page.getByRole("button", { name: "إظهار كلمة المرور" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "إخفاء كلمة المرور" }).click();
  await expect(password).toHaveAttribute("type", "password");

  await expect(page.getByRole("link", { name: "نسيت كلمة المرور؟" })).toHaveAttribute("href", "/forgot-password");
  await expect(page.getByRole("button", { name: "تسجيل الدخول" })).toBeVisible();
  await expect(page.getByRole("link", { name: "إنشاء حساب جديد" })).toHaveAttribute("href", "/register");
  await expect(page.getByRole("button", { name: "المتابعة عبر Google" })).toBeVisible();
});

test("register page contains identity, international WhatsApp, password and policy controls", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("img", { name: "RAIZEY STORE" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /أنشئ حسابك/ })).toBeVisible();
  await expect(page.locator(".auth-premium-card")).toHaveCount(1);

  await expect(page.getByLabel("الاسم الكامل")).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByLabel("رقم واتساب")).toBeVisible();
  await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByText("قوة كلمة المرور", { exact: true })).toBeVisible();
  await expect(page.getByLabel("تأكيد كلمة المرور", { exact: true })).toBeVisible();

  await expect(page.getByLabel(/أوافق على سياسة الخصوصية/)).not.toBeChecked();
  await expect(page.getByLabel(/أوافق على سياسة المتجر والشروط/)).not.toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(2);

  await expect(page.getByRole("button", { name: "إنشاء الحساب" })).toBeVisible();
  await expect(page.getByRole("button", { name: "التسجيل عبر Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: "تسجيل الدخول" })).toHaveAttribute("href", "/login");
});

test("WhatsApp selector defaults to Sudan and switches country calling code", async ({ page }) => {
  await page.goto("/register");

  const country = page.getByLabel(/الدولة ورمز الاتصال/);
  await expect(country).toHaveValue("SD");
  await expect(page.getByText("+249", { exact: true })).toBeVisible();

  await country.selectOption("EG");
  await expect(country).toHaveValue("EG");
  await expect(page.getByText("+20", { exact: true })).toBeVisible();
  await expect(page.getByLabel("رقم واتساب")).toHaveAttribute("dir", "ltr");
});

test("register page has no horizontal overflow on small screens", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/register");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("register password meter reacts without submitting real auth requests", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("FalconRiver9!X");
  await expect(page.getByText("قوية جدًا")).toBeVisible();
});

test("forgot password requests a six-digit code instead of a reset link", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { name: /استعد حسابك/ })).toBeVisible();
  await expect(page.getByText(/لن نرسل رابطًا/)).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  await expect(page.getByRole("button", { name: "إرسال رمز التحقق" })).toBeVisible();
});

test("signup verification screen accepts exactly six numeric digits", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "raizey_pending_email",
      value: "user@example.com",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "raizey_pending_purpose",
      value: "signup",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/verify-code");
  await expect(page.getByRole("heading", { name: /أكد بريدك/ })).toBeVisible();
  const code = page.getByRole("textbox", { name: "رمز التحقق", exact: true });
  await expect(code).toHaveAttribute("inputmode", "numeric");
  await expect(code).toHaveAttribute("maxlength", "6");
  await expect(code).toHaveAttribute("autocomplete", "one-time-code");
  await expect(page.getByRole("button", { name: "إعادة إرسال الرمز" })).toBeVisible();
});

test("recovery verification screen leads with identity verification copy", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "raizey_pending_email",
      value: "user@example.com",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "raizey_pending_purpose",
      value: "recovery",
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/verify-code");
  await expect(page.getByRole("heading", { name: /تحقق من هويتك/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "تأكيد الرمز" })).toBeVisible();
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
});
