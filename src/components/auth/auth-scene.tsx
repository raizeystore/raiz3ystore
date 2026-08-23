import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/src/components/brand-logo";

type AuthSceneProps = {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  features?: Array<{ title: string; text: string; icon: ReactNode }>;
};

/**
 * Shared shell for every auth screen: cinematic background, brand lockup,
 * hero copy and an optional feature row.
 *
 * The card itself is always supplied by the caller through `children` — this
 * component must never render a card wrapper, otherwise pages end up with a
 * card nested inside a card.
 */
export function AuthScene({ title, subtitle, children, features = [] }: AuthSceneProps) {
  const hasFeatures = features.length > 0;

  return (
    <main className="auth-stage">
      {/* Background is a decorative, replaceable image slot plus CSS grading. */}
      <div className="auth-cinematic-bg" aria-hidden="true">
        <div className="auth-cinematic-image" />
        <div className="auth-cinematic-grade" />
      </div>

      <div className="auth-stage-content">
        <header className="auth-stage-header">
          <Link href="/" className="auth-brand-link" aria-label="العودة إلى RAIZEY STORE">
            <BrandLogo size="lg" className="auth-brand-lockup" />
          </Link>

          <h1 className="auth-stage-title">{title}</h1>
          <p className="auth-stage-subtitle">{subtitle}</p>

          {hasFeatures ? (
            <ul className="auth-feature-row" aria-label="مزايا الحساب">
              {features.map((feature) => (
                <li className="auth-feature" key={feature.title}>
                  <span className="auth-feature-icon" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <span className="auth-feature-copy">
                    <strong>{feature.title}</strong>
                    <small>{feature.text}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {children}
      </div>
    </main>
  );
}

export default AuthScene;
