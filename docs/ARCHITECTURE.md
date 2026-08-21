# RAIZ3Y STORE — Architecture

## 1. System overview

```text
Browser / Mobile
      |
      v
Next.js App Router
      |
      +---- UI / Server Components
      |
      +---- Server Actions / Route Handlers
      |
      v
Supabase
  +-- PostgreSQL + RLS
  +-- Auth
  +-- Storage

Vercel -> application deployment
Sentry -> error and performance monitoring
GitHub -> source control
```

## 2. Boundaries

### UI
`app/` and `src/components/` contain presentation and interaction. UI must not own sensitive business rules.

### Services
`src/services/` contains domain operations and external integration boundaries.

### Library
`src/lib/` contains shared utilities and configuration. Server-only modules must be clearly separated from browser-safe modules.

### Types
`src/types/` contains shared domain contracts and TypeScript types.

### Database
`supabase/migrations/` is the source of truth for schema changes. Policies are part of the schema and security model.

### Tests
`tests/` contains automated tests as they are introduced.

## 3. Security model

- Authentication is handled by Supabase Auth.
- Authorization is enforced server-side and at the database layer.
- RLS protects user and business data.
- Client input is validated before business operations.
- Order totals and payment states are derived from trusted server/database data.
- Service-role credentials are server-only.
- Private receipt files are protected by Storage policies.
- Administrative actions are auditable.

## 4. Request flow

A sensitive operation follows this pattern:

`Client -> authenticated request -> server validation -> authorization -> domain service -> database/storage -> result`

The client never gets to decide whether an order is paid, fulfilled, refunded, or administratively approved.

## 5. AI boundary

AI features are downstream of the core system. AI can assist with customer support and receipt analysis, but deterministic business rules remain authoritative.

Receipt analysis flow:

`Upload -> file validation -> secure storage -> extraction/classification -> deterministic matching -> confidence/risk result -> manual review when needed`

## 6. Deployment

GitHub is the source repository. Vercel builds and deploys the Next.js application. Environment variables are configured in the deployment environment and are never committed.

## 7. Cost principle

The initial architecture targets free tiers. Any component that cannot remain within available free limits must be identified before adoption rather than silently introducing a paid dependency.
