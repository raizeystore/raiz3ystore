-- RAIZEY STORE — prevent legacy and Catalog V2 parent mixing
-- A product belongs to exactly one flow during the additive transition:
-- either one legacy game or one Catalog V2 subcategory, never both.

alter table public.products
  add constraint products_catalog_single_parent_check
  check ((game_id is null) <> (subcategory_id is null));

comment on constraint products_catalog_single_parent_check on public.products is
  'A product belongs to exactly one parent flow: legacy game XOR Catalog V2 subcategory.';
