# RAIZ3Y STORE — AI Development Rules

This repository follows `AGENTS.md` as the primary project instruction file. Read it before editing code.

## Non-negotiable rules

1. Never commit real secrets, tokens, service-role keys, passwords, or customer data.
2. `SUPABASE_SECRET_KEY` is server-only. Never expose it through a `NEXT_PUBLIC_` variable or Client Component.
3. The browser must never decide final price, payment state, order state, user role, or administrative authorization.
4. Sensitive writes must run through authenticated Server Actions / server-only code and trusted database operations.
5. Keep Supabase RLS enabled on exposed data and preserve ownership checks.
6. Receipt files remain private. Validate MIME type and size before upload.
7. AI receipt analysis is advisory; it is not the final financial authority.
8. Do not bypass existing idempotency, rate limits, audit logs, or order-state transition rules.
9. Database schema changes require a committed migration under `supabase/migrations/` and regenerated database types.
10. Run `npm run test:contracts`, `npm run lint`, `npm run typecheck`, and `npm run build` before considering a change complete.

## Architecture

- `app/`: Next.js App Router UI, Server Components, Server Actions, and route handlers.
- `src/lib/supabase/`: browser, SSR, proxy, and privileged Supabase clients.
- `src/types/database.ts`: generated database contract.
- `supabase/migrations/`: schema/security history and source of truth.
- `tests/`: automated contract/security tests.
- `docs/ARCHITECTURE.md`: system boundaries and security model.

If a requested change conflicts with these rules, preserve security and architecture first and explain the conflict in the change notes.
