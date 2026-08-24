-- RAIZEY STORE — server-only completed-sales popularity
-- Execution is restricted to service_role; no order aggregate is exposed through the public API.

create or replace function public.get_popular_products_server(p_limit integer default 8)
returns table (
  product_id uuid,
  total_quantity bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    oi.product_id,
    sum(oi.quantity)::bigint as total_quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  left join public.games g on g.id = p.game_id
  left join public.subcategories s on s.id = p.subcategory_id
  left join public.categories c on c.id = s.category_id
  where o.status = 'completed'::public.order_status
    and p.status = 'active'::public.product_status
    and (
      (
        p.subcategory_id is not null
        and s.status = 'active'::public.product_status
        and c.status = 'active'::public.product_status
      )
      or (
        p.subcategory_id is null
        and p.game_id is not null
        and g.status = 'active'::public.product_status
      )
    )
  group by oi.product_id
  order by sum(oi.quantity) desc, oi.product_id
  limit greatest(0, least(coalesce(p_limit, 8), 20));
$$;

revoke all on function public.get_popular_products_server(integer) from public, anon, authenticated;
grant execute on function public.get_popular_products_server(integer) to service_role;

comment on function public.get_popular_products_server(integer) is
  'Server-only completed-order aggregation. Storefront callers receive product ranking only, never quantities or order data.';

notify pgrst, 'reload schema';
