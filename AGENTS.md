# RAIZ3Y STORE — AI Development Rules

## Project
RAIZ3Y STORE is a secure game-top-up storefront. The project is built and maintained from a phone, so all workflows must remain practical through web-based tools when possible.

## Required stack
- Next.js + TypeScript
- Supabase for PostgreSQL, Auth, and Storage
- Vercel for deployment
- Sentry for error monitoring when production monitoring is enabled
- GitHub for source control

## Required project skills
Before implementing or reviewing UI/frontend work, read the relevant files in `/skills`:
- `skills/ui-ux-pro-max.md`
- `skills/frontend-design.md`
- `skills/vercel-web-design-guidelines.md`
- `skills/vercel-react-best-practices.md`
- `skills/accessibility-best-practices.md`
- `skills/agent-browser-testing.md`
- `skills/playwright-e2e-testing.md`

For Supabase work, also follow the current official Supabase skill/docs and re-check changing APIs before implementation.

## Non-negotiable rules
1. Inspect existing code before changing it.
2. Never commit secrets, private keys, service-role keys, or production credentials.
3. Never trust client-provided prices, order totals, roles, payment states, or fulfillment states.
4. Sensitive authorization must be enforced server-side and/or through database policies.
5. Supabase Row Level Security (RLS) is part of the security model; do not bypass it casually.
6. Receipt images and other private uploads must use restrictive Storage policies.
7. AI may assist with classification and customer support, but must not independently authorize sensitive financial or administrative actions.
8. Prefer free tiers and open-source solutions when they are technically suitable. Flag any feature that requires paid infrastructure before adopting it.
9. Keep domain logic separate from UI code.
10. For every task, verify the result and report changed files, tests/checks performed, and remaining risks.
11. Do not create final brand styling before an approved identity direction, color system, typography, and logo treatment exist.
12. Customer-facing UI targets WCAG 2.2 AA and must remain usable on mobile, tablet, and desktop.
13. Avoid generic AI-looking interface patterns; visual decisions must be deliberate and tied to RAIZ3Y's brand.

## Workflow
- Read relevant files and project skills.
- Confirm dependencies and constraints.
- Make the smallest coherent change.
- Validate the change.
- Update documentation/task status when the task is complete.
