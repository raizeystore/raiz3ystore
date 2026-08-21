# RAIZ3Y STORE — AI Development Rules

## Project
RAIZ3Y STORE is a secure game-top-up storefront. The project is built and maintained from a phone, so all workflows must remain practical through web-based tools when possible.

## Required stack
- Next.js + TypeScript
- Supabase for PostgreSQL, Auth, and Storage
- Vercel for deployment
- Sentry for error monitoring
- GitHub for source control

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

## Workflow
- Read relevant files.
- Confirm dependencies and constraints.
- Make the smallest coherent change.
- Validate the change.
- Update documentation/task status when the task is complete.
