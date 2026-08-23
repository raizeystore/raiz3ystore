import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/src/components/brand-logo";

type AuthSceneProps = {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  features?: Array<{ title: string; text: string; icon: ReactNode }>;
};

export function AuthScene({ title, subtitle, children, features = [] }: AuthSceneProps) {
  return (
    <main className="auth-stage">
      <div className="auth-cinematic-bg" aria-hidden="true" />

      <div className="auth-stage-content">
        <header className="auth-stage-header">
          <Link href="/" className="auth-brand-link" aria-label="العودة إلى RAIZEY STORE">
            <BrandLogo className="auth-brand-lockup" />
          </Link>

          <h1>{title}</h1>
          <p>{subtitle}</p>

          {features.length > 0 && (
            <div className="auth-feature-row" aria-label="مزايا الحساب">
              {features.map((feature) => (
                <div className="auth-feature" key={feature.title}>
                  <span className="auth-feature-icon" aria-hidden="true">{feature.icon}</span>
                  <span>
                    <strong>{feature.title}</strong>
                    <small>{feature.text}</small>
                  </span>
                </div>
              ))}
            </div>
          )}
        </header>

        {children}
      </div>
    </main>
  );
}
