# RAIZEY STORE — Admin UX Simplification

## Scope

This change simplifies the existing Catalog V2 and account security experience without replacing the normalized database model.

- Every header placement uses the official full `public/brand/raizey-store-logo.png` asset.
- Account security cards are compacted for mobile.
- `/admin/catalog` becomes the guided one-page entry point for section → package → product creation.
- Slug, SKU, and internal field keys are generated or preserved by the server and are not normal admin inputs.
- Category, package, product, and banner images are uploaded from the device to the `catalog-media` Supabase Storage bucket by the server-only privileged client after `requireAdmin()`.
- Catalog media accepts JPEG, PNG, and WebP only, up to 5MB. Payment receipts remain in their separate private bucket.
- Product suboptions can be attached directly to the product through an internal `__BASE__` variant while keeping the normalized schema unchanged.
- Direct suboption prices remain absolute: selected suboption → selected visible variant → product base price.
- Banner mobile artwork is optional and falls back to the desktop artwork on the storefront.

## Rollback

Application rollback: deploy or revert to `45addb932f38146fa43fc41010ccd407f2c9c66c`.

Database/storage rollback should be non-destructive:

1. Revert the application first.
2. Keep the `catalog-media` bucket while any category, package, product, or banner row references an object in it.
3. Do not move catalog media into the private receipt bucket.
4. A later cleanup migration may remove `catalog-media` only after checking that no database row references its public URLs.
5. The internal `__BASE__` product variant should remain if any `product_suboptions` row references it.

No existing Catalog V2 table or legacy checkout table is dropped by this change.
