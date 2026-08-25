-- RAIZEY STORE — Cover cart foreign keys used by cleanup and relational lookups.

create index if not exists cart_items_product_id_idx
  on public.cart_items(product_id);

create index if not exists cart_items_variant_id_idx
  on public.cart_items(variant_id)
  where variant_id is not null;

create index if not exists cart_items_suboption_id_idx
  on public.cart_items(suboption_id)
  where suboption_id is not null;
