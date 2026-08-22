# RAIZ3Y — Playwright E2E Testing

Use for critical business journeys once UI routes are stable.

## Critical journeys
- Sign up and email-confirmation entry points.
- Login, logout, password recovery.
- Browse game/product, select offer, checkout initiation.
- Authenticated order visibility and ownership boundaries.
- Receipt upload validation and review state.
- Admin access control, product/order/payment management.

## Rules
1. Tests must use stable roles/labels/test IDs only where semantics are insufficient.
2. Never disable auth/security checks to make tests pass.
3. Test happy path plus permission failure, validation failure, and retry/error states.
4. Avoid brittle sleeps; wait on observable UI/network state.
5. Keep production secrets out of test fixtures.
6. Run focused E2E for changed critical flows before release when test infrastructure is available.
