import Link from "next/link";
import { BrandLogo } from "@/src/components/brand-logo";
import { POLICY_EFFECTIVE_DATE_AR, PRIVACY_VERSION } from "@/src/lib/auth/policies";

export default function PrivacyPage() {
  return (
    <main className="legal-shell">
      <div className="legal-container">
        <Link href="/" aria-label="العودة إلى المتجر"><BrandLogo /></Link>
        <article className="legal-card">
          <span className="card-kicker">PRIVACY • VERSION {PRIVACY_VERSION}</span>
          <h1>سياسة الخصوصية</h1>
          <p className="legal-lead">توضح هذه الصفحة بصورة مبسطة كيف يتعامل RAIZEY STORE مع بيانات الحساب والطلبات. تاريخ السريان: {POLICY_EFFECTIVE_DATE_AR}.</p>

          <h2>البيانات التي نجمعها</h2>
          <p>قد نعالج الاسم، البريد الإلكتروني، رقم واتساب، بيانات اللاعب المطلوبة لتنفيذ الشحن، تفاصيل الطلب، وحالة الدفع. عند رفع إيصال دفع يتم حفظه في مساحة تخزين خاصة للمراجعة.</p>

          <h2>لماذا نستخدم البيانات</h2>
          <p>نستخدم البيانات لإنشاء الحساب وتأمين الجلسة، تنفيذ الطلبات، مراجعة المدفوعات، تقديم الدعم، منع الاحتيال، وتحسين موثوقية الخدمة.</p>

          <h2>مشاركة البيانات</h2>
          <p>لا نبيع بيانات العملاء. قد تعتمد الخدمة على مزودي بنية تحتية وتقنيات مثل Supabase للاستضافة والمصادقة والبيانات، Vercel لتشغيل الموقع، وSentry لمراقبة الأخطاء، بالقدر اللازم لتشغيل الخدمة.</p>

          <h2>حماية البيانات</h2>
          <p>نستخدم صلاحيات وصول مقيدة، سياسات RLS، تخزينًا خاصًا للإيصالات، واتصالات مشفرة. لا ينبغي إرسال كلمات المرور أو رموز الدخول إلى الدعم.</p>

          <h2>الاحتفاظ والتحديث</h2>
          <p>نحتفظ بالسجلات بالقدر اللازم لتشغيل الطلبات والأمان والتدقيق. قد يتم تحديث السياسة عند تغير الخدمة، ويظهر رقم النسخة في أعلى الصفحة.</p>

          <div className="legal-actions"><Link className="btn btn-secondary" href="/register">العودة لإنشاء الحساب</Link><Link className="text-link" href="/terms">سياسة المتجر والشروط</Link></div>
        </article>
      </div>
    </main>
  );
}
