# RAIZEY STORE — Catalog V2

## Official hierarchy

The customer and admin flows use one normalized hierarchy:

1. `categories` — visual top-level sections only.
2. `subcategories` — packages/services that belong to one category.
3. `products` — purchasable product pages that belong to one subcategory.
4. `product_variants` — primary choices such as 60 UC or 325 UC.
5. `product_suboptions` — optional conditional choices attached to one variant.
6. `product_input_fields` — customer data fields attached to one product.

Legacy `games` and `products.game_id` remain available during the additive migration. New Catalog V2 products use `subcategory_id` and leave `game_id` null.

## Price selection contract

The selected USD price is absolute, not additive:

1. selected active suboption price;
2. otherwise selected active variant price;
3. otherwise product `base_price_usd`.

The customer display price applies the server-sourced exchange rate and profit margin. A future cart/checkout quote must recalculate the same contract on the server or in an atomic RPC before creating an order. The current Catalog V2 UI intentionally does not send its displayed price into the legacy checkout RPC.

## Admin routes

- `/admin/catalog` — compact overview.
- `/admin/catalog/categories` — category CRUD without hard delete.
- `/admin/catalog/subcategories` — subcategory CRUD with required category selection.
- `/admin/catalog/products` — product CRUD with required subcategory selection.
- `/admin/catalog/products/[id]` — variants, suboptions, and customer input fields.
- `/admin/settings/banners` — scheduled responsive banner management.

Every mutation requires the existing server-side admin session check, writes through the server-only Supabase client, validates parent relationships, and records an audit event. Status changes (`active`, `inactive`, `archived`) replace destructive deletion.

## Migrations

- `20260824214439_add_catalog_v2.sql` — additive normalized tables, relations, indexes, RLS, and active-read policies.
- `20260824222247_harden_catalog_v2_read_paths.sql` — banner CTA text and full active-parent checks for public reads.
- `20260824222446_add_server_only_completed_sales_popularity.sql` — completed-order popularity aggregation executable only by `service_role`.
- `20260824225440_enforce_catalog_product_parent_exclusivity.sql` — database XOR constraint preventing a product from belonging to both legacy and Catalog V2 parents.

## Rollback plan

Application rollback is the primary safe rollback: revert the Catalog V2 feature commit or deploy the previous `main` SHA. The legacy `games` flow remains intact.

Database rollback should remain non-destructive while Catalog V2 data may exist:

1. Mark Catalog V2 categories, subcategories, products, and banners `inactive`.
2. Revert the application to the legacy routes.
3. Revoke and drop `public.get_popular_products_server(integer)` if the new application no longer calls it.
4. Restore the previous `products_public_read_active`, `product_suboptions_public_read_active`, and `product_input_fields_public_read_active` policies only after verifying the legacy application requirements.
5. Keep the additive tables, foreign-key columns, and `banners.button_text` until a separately reviewed cleanup phase confirms that no orders or audit records reference them.

Do not drop Catalog V2 tables or columns as part of an emergency application rollback.
