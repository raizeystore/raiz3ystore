# RAIZEY STORE — Admin V2 baseline

## Purpose
This file records the rollback point before the Admin Control Center reorganization

## Git baseline
- Production branch: `main`
- Baseline commit: `864159d56e0c734d1bff0aa7ba2a1be048ac6963`
- Backup branch: `backup/pre-admin-v2-20260824`
- Feature branch: `feat/admin-v2-control-center`

## Database baseline
No database migration is part of Admin V2 Phase 1

Existing public application tables at the start of the phase
- profiles
- games
- products
- payment_methods
- orders
- order_items
- payments
- payment_receipts
- order_status_history
- notifications
- audit_logs
- store_settings

RLS was confirmed enabled on all public application tables before this UI phase

## Scope of this phase
- Reorganize the admin navigation
- Replace the long admin home page with a compact dashboard
- Move pricing settings into a dedicated settings route
- Keep payment review and fulfillment inside the orders route
- Add dedicated customer finance marketing staff and audit workspaces
- Preserve existing server actions database tables payment logic auth and Supabase policies

## Rollback
Before merge
- Close the pull request and continue using `main`

After merge
- Revert the Admin V2 merge commit
- No SQL rollback is required because this phase contains no schema migration

Do not delete the backup branch until the next catalog migration has passed regression and production verification
