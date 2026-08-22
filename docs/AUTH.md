# RAIZEY STORE — Authentication

## Supported flows

- Email/password sign in at `/login`.
- Dedicated email registration at `/register`.
- Google OAuth through Supabase Auth using PKCE and `/auth/callback`.
- Email confirmation and password recovery through `/auth/confirm`.
- Incomplete OAuth/legacy accounts are routed to `/complete-profile`.

## Required registration data

Email registration requires:
- full name
- email
- WhatsApp number
- password and confirmation
- privacy policy acceptance
- store terms acceptance

Policy acceptance is versioned. The current versions live in `src/lib/auth/policies.ts` and acceptance timestamps/versions are copied into `public.profiles` by protected database triggers.

## Security boundaries

- Authorization never uses user-editable `user_metadata` for roles or admin access.
- OAuth callback exchanges the PKCE authorization code server-side and validates the resulting account state.
- Google users without required profile data must complete their account before entering protected account pages.
- Auth and account routes use `Cache-Control: private, no-store`.
- Supabase secret/service credentials remain server-only.

## Redirects

`NEXT_PUBLIC_SITE_URL` may be configured as the canonical production origin. If absent, server actions derive the current origin from request/forwarded headers. Supabase Auth redirect allowlists must contain the deployed `/auth/callback` and `/auth/confirm` origins used by the application.
