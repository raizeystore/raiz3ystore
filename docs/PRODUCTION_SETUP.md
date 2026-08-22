# RAIZEY STORE — Production Setup

## Vercel Environment Variables

Required public variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Required server-only variable before enabling checkout/admin mutations:

- `SUPABASE_SECRET_KEY`

Rules:

- Never prefix `SUPABASE_SECRET_KEY` with `NEXT_PUBLIC_`.
- Never commit the real value to GitHub.
- Enable it only for environments that need trusted server mutations.

## Supabase Auth URLs

Set the Supabase Auth Site URL to the canonical production Vercel/domain URL.
Add the production URL and required preview URLs to the redirect allow list.

The application confirmation endpoint is:

`/auth/confirm`

The password recovery destination is:

`/reset-password`

For SSR email confirmation, the confirmation email template must send the token hash to the application endpoint. The expected pattern is:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

Password recovery must similarly return through the app confirmation flow and then continue to `/reset-password`.

## Security model

- Browser clients use only the publishable Supabase key.
- Sensitive order totals, payment state, fulfillment state, roles, and admin mutations are never accepted from the browser as authority.
- Checkout and admin writes use trusted server-side code.
- Payment receipt storage is private.
- RLS and SQL grants are both enforced.
