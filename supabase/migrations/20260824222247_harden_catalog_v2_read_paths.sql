-- RAIZEY STORE — Catalog V2 follow-up
-- Additive banner control and complete public-read ancestry checks.

alter table public.banners
  add column if not exists button_text text
  check (button_text is null or char_length(button_text) <= 80);

drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active
on public.products for select
to anon, authenticated
using (
  private.is_admin()
  or (
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
  )
);

drop policy if exists product_suboptions_public_read_active on public.product_suboptions;
create policy product_suboptions_public_read_active
on public.product_suboptions for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.subcategories s on s.id = p.subcategory_id
    join public.categories c on c.id = s.category_id
    where v.id = product_suboptions.variant_id
      and v.status = 'active'::public.product_status
      and p.status = 'active'::public.product_status
      and s.status = 'active'::public.product_status
      and c.status = 'active'::public.product_status
  )
);

drop policy if exists product_input_fields_public_read_active on public.product_input_fields;
create policy product_input_fields_public_read_active
on public.product_input_fields for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1
    from public.products p
    join public.subcategories s on s.id = p.subcategory_id
    join public.categories c on c.id = s.category_id
    where p.id = product_input_fields.product_id
      and p.status = 'active'::public.product_status
      and s.status = 'active'::public.product_status
      and c.status = 'active'::public.product_status
  )
);

comment on column public.banners.button_text is
  'Optional storefront call-to-action label. The banner remains navigable only when link_url is set.';

notify pgrst, 'reload schema';
