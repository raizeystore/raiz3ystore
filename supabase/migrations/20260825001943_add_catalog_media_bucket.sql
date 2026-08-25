-- Public storefront media only. Sensitive receipts remain in the private
-- payment-receipts bucket.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catalog-media',
  'catalog-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No INSERT/UPDATE/DELETE policy is intentionally added for catalog-media.
-- Admin uploads go through the server-only privileged client after requireAdmin().
-- Public read access is provided by the bucket's public flag.
