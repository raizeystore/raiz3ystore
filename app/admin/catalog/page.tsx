import Link from "next/link";
import { Archive, CircleCheck, Gamepad2, Package, Save, WalletCards } from "lucide-react";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { updateGame, updatePaymentMethod, updateProductCatalog } from "@/app/admin/catalog/actions";

const controlStyle = {
  width: "100%",
  minHeight: 46,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  background: "#0d0d0e",
  color: "var(--text)",
} as const;

const textareaStyle = { ...controlStyle, minHeight: 104, resize: "vertical" } as const;

function statusLabel(status: string) {
  if (status === "active") return "نشط";
  if (status === "inactive") return "متوقف";
  return "مؤرشف";
}

function messageText(message?: string) {
  if (message === "game_updated") return "تم تحديث اللعبة";
  if (message === "product_updated") return "تم تحديث بيانات المنتج";
  if (message === "payment_method_updated") return "تم تحديث طريقة الدفع";
  return undefined;
}

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const query = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: games }, { data: products }, { data: paymentMethods }] = await Promise.all([
    admin.from("games").select("id, name, slug, description, status, sort_order").order("sort_order").order("name"),
    admin.from("products").select("id, game_id, name, slug, sku, description, status, sort_order, price, currency").order("sort_order").order("name"),
    admin.from("payment_methods").select("id, name, code, account_label, account_identifier, instructions, status, sort_order").order("sort_order").order("name"),
  ]);

  const success = messageText(query.message);

  return (
    <main className="site-shell">
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />CATALOG CONTROL</span>
              <h1>إدارة الكتالوج</h1>
              <p>عدّل الألعاب والمنتجات وطرق الدفع من مكان واحد مع الاحتفاظ بسجل تدقيق لكل تغيير</p>
            </div>
            <div className="nav-actions">
              <Link className="btn btn-secondary" href="/admin">العودة للوحة الإدارة</Link>
              <Link className="btn btn-secondary" href="/admin/products">التسعير وبيانات اللاعب</Link>
            </div>
          </div>

          {success && <div className="notice" role="status">{success}</div>}
          {query.error && <div className="notice notice-error" role="alert">تعذر حفظ التعديل تحقق من القيم وحاول مرة أخرى</div>}

          <div className="cta-band" style={{ marginBottom: 28 }}>
            <div>
              <h2>إدارة آمنة بدون حذف نهائي</h2>
              <p>استخدم متوقف أو مؤرشف بدل حذف العناصر حتى تبقى الطلبات والسجلات القديمة قابلة للتدقيق</p>
            </div>
            <Archive aria-hidden="true" size={28} strokeWidth={2} />
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GAMES</span>
              <h2>الألعاب</h2>
              <p>الاسم والرابط والترتيب والحالة التي تظهر بها اللعبة في واجهة المتجر</p>
            </div>
            <Gamepad2 aria-hidden="true" size={30} strokeWidth={2} />
          </div>

          {!games?.length ? (
            <div className="cta-band"><div><h2>لا توجد ألعاب حتى الآن</h2><p>أضف أول لعبة من لوحة الإدارة</p></div><Link className="btn btn-primary" href="/admin">إضافة لعبة</Link></div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {games.map((game) => (
                <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={game.id}>
                  <div className="auth-card-header">
                    <span className="card-kicker">{statusLabel(game.status)} · ترتيب {game.sort_order}</span>
                    <h2>{game.name}</h2>
                  </div>
                  <form className="auth-form" action={updateGame}>
                    <input type="hidden" name="gameId" value={game.id} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                      <label className="field"><span className="field-label">اسم اللعبة</span><input name="name" required maxLength={120} defaultValue={game.name} /></label>
                      <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={game.slug} /></label>
                      <label className="field"><span className="field-label">الحالة</span><select name="status" defaultValue={game.status} style={controlStyle}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" inputMode="numeric" defaultValue={game.sort_order} /></label>
                    </div>
                    <label className="field"><span className="field-label">الوصف</span><textarea name="description" maxLength={1000} defaultValue={game.description ?? ""} style={textareaStyle} /></label>
                    <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} strokeWidth={2} /> حفظ اللعبة</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PRODUCTS</span>
              <h2>المنتجات والعروض</h2>
              <p>عدّل بيانات العرض الأساسية هنا واترك التسعير وحقول اللاعب لصفحة المنتجات والتسعير</p>
            </div>
            <Package aria-hidden="true" size={30} strokeWidth={2} />
          </div>

          {!products?.length ? (
            <div className="cta-band"><div><h2>لا توجد منتجات حتى الآن</h2><p>أضف المنتج الأول من لوحة الإدارة</p></div><Link className="btn btn-primary" href="/admin">إضافة منتج</Link></div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {products.map((product) => (
                <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={product.id}>
                  <div className="auth-card-header">
                    <span className="card-kicker">{statusLabel(product.status)} · {new Intl.NumberFormat("ar-SD").format(product.price)} {product.currency}</span>
                    <h2>{product.name}</h2>
                  </div>
                  <form className="auth-form" action={updateProductCatalog}>
                    <input type="hidden" name="productId" value={product.id} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                      <label className="field"><span className="field-label">اللعبة</span><select name="gameId" required defaultValue={product.game_id} style={controlStyle}>{(games ?? []).map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select></label>
                      <label className="field"><span className="field-label">اسم العرض</span><input name="name" required maxLength={120} defaultValue={product.name} /></label>
                      <label className="field"><span className="field-label">Slug</span><input name="slug" required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" defaultValue={product.slug} /></label>
                      <label className="field"><span className="field-label">SKU</span><input name="sku" maxLength={80} dir="ltr" defaultValue={product.sku ?? ""} /></label>
                      <label className="field"><span className="field-label">الحالة</span><select name="status" defaultValue={product.status} style={controlStyle}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" inputMode="numeric" defaultValue={product.sort_order} /></label>
                    </div>
                    <label className="field"><span className="field-label">الوصف</span><textarea name="description" maxLength={1000} defaultValue={product.description ?? ""} style={textareaStyle} /></label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <button className="btn btn-primary" type="submit"><Save aria-hidden="true" size={18} strokeWidth={2} /> حفظ بيانات العرض</button>
                      <Link className="btn btn-secondary" href="/admin/products">التسعير وبيانات اللاعب</Link>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PAYMENT METHODS</span>
              <h2>طرق الدفع</h2>
              <p>يمكن تعطيل أي طريقة فورًا بدون حذف بياناتها أو كسر الطلبات السابقة</p>
            </div>
            <WalletCards aria-hidden="true" size={30} strokeWidth={2} />
          </div>

          {!paymentMethods?.length ? (
            <div className="cta-band"><div><h2>لا توجد طرق دفع حتى الآن</h2><p>أضف أول طريقة دفع من لوحة الإدارة</p></div><Link className="btn btn-primary" href="/admin">إضافة طريقة دفع</Link></div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {paymentMethods.map((method) => (
                <article className="auth-card" style={{ width: "100%", maxWidth: "none" }} key={method.id}>
                  <div className="auth-card-header">
                    <span className="card-kicker">{statusLabel(method.status)} · {method.code}</span>
                    <h2>{method.name}</h2>
                  </div>
                  <form className="auth-form" action={updatePaymentMethod}>
                    <input type="hidden" name="methodId" value={method.id} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                      <label className="field"><span className="field-label">اسم الطريقة</span><input name="name" required maxLength={100} defaultValue={method.name} /></label>
                      <label className="field"><span className="field-label">Code</span><input name="code" required maxLength={40} pattern="[A-Za-z0-9_-]{2,40}" dir="ltr" defaultValue={method.code} /></label>
                      <label className="field"><span className="field-label">اسم الحساب أو الوصف</span><input name="accountLabel" maxLength={120} defaultValue={method.account_label ?? ""} /></label>
                      <label className="field"><span className="field-label">رقم الحساب أو المعرف</span><input name="accountIdentifier" required maxLength={180} dir="ltr" defaultValue={method.account_identifier ?? ""} /></label>
                      <label className="field"><span className="field-label">الحالة</span><select name="status" defaultValue={method.status} style={controlStyle}><option value="active">نشط</option><option value="inactive">متوقف</option><option value="archived">مؤرشف</option></select></label>
                      <label className="field"><span className="field-label">الترتيب</span><input name="sortOrder" type="number" min="0" step="1" inputMode="numeric" defaultValue={method.sort_order} /></label>
                    </div>
                    <label className="field"><span className="field-label">تعليمات الدفع</span><textarea name="instructions" maxLength={1000} defaultValue={method.instructions ?? ""} style={textareaStyle} /></label>
                    <button className="btn btn-primary" type="submit"><CircleCheck aria-hidden="true" size={18} strokeWidth={2} /> حفظ طريقة الدفع</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
