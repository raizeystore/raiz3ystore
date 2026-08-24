import Link from "next/link";
import { BadgeCheck, Gamepad2, LifeBuoy, Send, UserRound, Zap } from "lucide-react";
import { BrandLogo } from "@/src/components/brand-logo";
import { IconBox } from "@/src/components/ui/icon-box";

const games = [
  { short: "PUBG", name: "PUBG MOBILE", subtitle: "شحن شدات بسرعة وأمان" },
  { short: "FF", name: "FREE FIRE", subtitle: "جواهر وباقات بأسعار واضحة" },
  { short: "COD", name: "CALL OF DUTY", subtitle: "نقاط CP وخيارات شحن مرنة" },
  { short: "EF", name: "eFOOTBALL", subtitle: "منتجات وخدمات للاعبين" },
];

const benefits = [
  { icon: Zap, title: "تنفيذ سريع", text: "تجربة طلب واضحة ومتابعة للحالة من لحظة الإرسال وحتى اكتمال التنفيذ." },
  { icon: BadgeCheck, title: "أسعار موثوقة", text: "التسعير يُدار من النظام ولا يعتمد على قيم يرسلها المتصفح أو العميل." },
  { icon: LifeBuoy, title: "دعم عند الحاجة", text: "قنوات دعم واضحة للطلبات والاستفسارات ومراجعة التحويلات يدويًا عند الحاجة." },
];

const steps = [
  { number: "1", icon: Gamepad2, title: "اختر لعبتك", text: "ادخل على اللعبة أو الخدمة وحدد العرض المناسب لك." },
  { number: "2", icon: UserRound, title: "أدخل بياناتك", text: "أدخل معرف اللاعب والبيانات المطلوبة لكل منتج بصورة واضحة." },
  { number: "3", icon: Send, title: "أرسل الطلب", text: "اختر طريقة الدفع وأكمل الطلب ثم تابع حالته من حسابك." },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link href="/" aria-label="العودة إلى الرئيسية">
            <BrandLogo />
          </Link>

          <nav className="nav-links" aria-label="التنقل الرئيسي">
            <Link href="/games">الألعاب</Link>
            <Link href="#why-us">لماذا RAIZEY</Link>
            <Link href="#how-it-works">كيف تطلب</Link>
          </nav>

          <div className="nav-actions">
            <Link className="btn btn-secondary" href="/games">استعرض الألعاب</Link>
            <Link className="btn btn-primary" href="/login">دخول</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" />متجر شحن ألعاب رقمي</span>
            <h1>قوة اللعب <span>في إيدك.</span></h1>
            <p className="hero-copy">
              اشحن ألعابك وخدماتك الرقمية من مكان واحد، بتجربة سريعة وواضحة مصممة للموبايل أولًا وبمعايير أمان قوية.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/games">ابدأ الشحن الآن</Link>
              <Link className="btn btn-secondary" href="/login">تسجيل الدخول</Link>
            </div>
            <div className="trust-row" aria-label="مزايا المتجر">
              <span className="trust-chip">حماية للحساب</span>
              <span className="trust-chip">متابعة حالة الطلب</span>
              <span className="trust-chip">دعم عند الحاجة</span>
            </div>
          </div>

          <div className="hero-panel" aria-label="معاينة عروض المتجر">
            <article className="featured-card featured-card--main">
              <span className="card-kicker">عرض مميز</span>
              <h3>PUBG MOBILE</h3>
              <p>اختيارات شحن منظمة مع بيانات لاعب واضحة قبل تنفيذ الطلب.</p>
              <div className="price-line">
                <div><small>ابتداءً من</small><br /><strong>—</strong></div>
                <Link className="btn btn-primary" href="/games">استعرض</Link>
              </div>
            </article>

            <article className="featured-card featured-card--float">
              <span className="card-kicker">طلبك تحت السيطرة</span>
              <h3>متابعة واضحة للحالة</h3>
              <p>من الدفع والمراجعة إلى التنفيذ والاكتمال.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted" id="games">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">الألعاب والخدمات</span>
              <h2>الأكثر طلبًا</h2>
            </div>
            <p>معاينة لأشهر الفئات. الكتالوج الفعلي والأسعار الحقيقية موجودة في صفحة الألعاب.</p>
          </div>

          <div className="games-grid">
            {games.map((game) => (
              <Link className="game-card" data-short={game.short} href="/games" key={game.name}>
                <span>RAIZEY GAME TOP-UP</span>
                <h3>{game.name}</h3>
                <p>{game.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="why-us">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ليش تختارنا؟</span>
              <h2>تجربة مصممة للثقة والسرعة</h2>
            </div>
            <p>التصميم والوظائف مبنية حول الطلب الحقيقي: أقل خطوات، أقل ارتباك، ومعلومات أوضح.</p>
          </div>

          <div className="info-grid">
            {benefits.map((item) => (
              <article className="info-card" key={item.title}>
                <IconBox icon={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="how-it-works">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">كيف تطلب؟</span>
              <h2>ثلاث خطوات واضحة</h2>
            </div>
            <p>الشراء حيكون بسيط حتى من شاشة موبايل صغيرة، مع تحقق واضح من البيانات قبل الإرسال.</p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <article className="step-card" key={step.number}>
                  <div className="step-number" aria-hidden="true">
                    <StepIcon size={20} strokeWidth={2} />
                  </div>
                  <span className="card-kicker">الخطوة {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-band">
          <div>
            <h2>جاهز تبدأ؟</h2>
            <p>أنشئ حسابك وخلي طلباتك ومتابعتها في مكان واحد.</p>
          </div>
          <Link className="btn btn-primary" href="/login">دخول أو إنشاء حساب</Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-row">
          <BrandLogo variant="footer" />
          <span>© 2026 RAIZEY STORE — جميع الحقوق محفوظة.</span>
        </div>
      </footer>
    </main>
  );
}
