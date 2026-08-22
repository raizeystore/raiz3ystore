import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
import { POLICY_EFFECTIVE_DATE_AR, TERMS_VERSION } from "@/src/lib/auth/policies";

export default function TermsPage() {
  return (
    <main className="legal-shell">
      <div className="legal-container">
        <Link href="/" aria-label="العودة إلى المتجر"><BrandLogo /></Link>
        <article className="legal-card">
          <span className="card-kicker">STORE TERMS • VERSION {TERMS_VERSION}</span>
          <h1>سياسة المتجر والشروط</h1>
          <p className="legal-lead">باستخدام RAIZEY STORE فإنك توافق على قواعد تشغيل خدمات الشحن والطلبات الموضحة هنا. تاريخ السريان: {POLICY_EFFECTIVE_DATE_AR}.</p>

          <h2>الحساب والبيانات</h2>
          <p>يجب إدخال بيانات صحيحة، والمحافظة على سرية كلمة المرور. يتحمل العميل مسؤولية صحة Player ID واسم اللاعب وأي بيانات مطلوبة لتنفيذ الخدمة.</p>

          <h2>الأسعار والطلبات</h2>
          <p>السعر المعتمد هو السعر الذي يحفظه النظام وقت إنشاء الطلب. قد تتغير أسعار العروض المستقبلية عند تغير سعر الصرف أو تكاليف الخدمة، ولا يؤدي ذلك إلى تغيير سعر طلب تم إنشاؤه بالفعل.</p>

          <h2>الدفع ومراجعة الإيصالات</h2>
          <p>في طرق الدفع اليدوية يجب رفع إيصال صحيح يخص عملية الدفع الفعلية. تخضع الإيصالات للمراجعة، وقد يتم رفض الطلب عند عدم تطابق المبلغ أو البيانات أو عند الاشتباه في إيصال غير صحيح.</p>

          <h2>تنفيذ الخدمة</h2>
          <p>يمر الطلب بحالات واضحة مثل انتظار الدفع، مراجعة الدفع، قيد التنفيذ، ومكتمل. زمن التنفيذ قد يختلف حسب اللعبة أو توفر الخدمة أو مراجعة الدفع.</p>

          <h2>الإلغاء والاسترداد</h2>
          <p>الخدمات الرقمية التي تم تنفيذها بنجاح لا يمكن عكسها عادة. تتم مراجعة حالات الإلغاء أو الاسترداد قبل التنفيذ أو عند تعذر تقديم الخدمة وفق حالة الطلب والدفع.</p>

          <h2>الاستخدام غير المسموح</h2>
          <p>يمنع استخدام إيصالات مزورة، محاولات الاحتيال، إساءة استخدام الحسابات، أو محاولة تجاوز أنظمة الحماية. قد يتم تعليق الحساب عند وجود نشاط ضار أو مخالف.</p>

          <div className="legal-actions"><Link className="btn btn-secondary" href="/register">العودة لإنشاء الحساب</Link><Link className="text-link" href="/privacy">سياسة الخصوصية</Link></div>
        </article>
      </div>
    </main>
  );
}
