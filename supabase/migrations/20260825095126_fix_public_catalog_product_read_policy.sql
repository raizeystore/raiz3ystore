-- Public catalog reads must not call private helpers that anon cannot execute.
-- Admin screens use the server-only service role and do not rely on this policy.

drop policy if exists products_public_read_active on public.products;

create policy products_public_read_active
on public.products
for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and (
    (
      subcategory_id is not null
      and exists (
        select 1
        from public.subcategories s
        join public.categories c on c.id = s.category_id
        where s.id = products.subcategory_id
          and s.status = 'active'::public.product_status
          and c.status = 'active'::public.product_status
      )
    )
    or (
      subcategory_id is null
      and game_id is not null
      and exists (
        select 1
        from public.games g
        where g.id = products.game_id
          and g.status = 'active'::public.product_status
      )
    )
  )
);

notify pgrst, 'reload schema';
