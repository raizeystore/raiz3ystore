-- RAIZEY STORE — Catalog product selection, persistent cart, and secure checkout

alter table public.product_variants
  add column suboptions_required boolean not null default false;

alter table public.product_suboptions
  add column applies_to_all_variants boolean not null default false,
  add column price_mode text not null default 'absolute'
    check (price_mode in ('absolute', 'delta')),
  add constraint product_suboptions_global_price_mode_check
    check (applies_to_all_variants is false or price_mode = 'delta');

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete restrict,
  suboption_id uuid references public.product_suboptions(id) on delete restrict,
  quantity integer not null default 1 check (quantity between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index cart_items_user_selection_uidx
on public.cart_items (
  user_id,
  product_id,
  coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(suboption_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

create index cart_items_user_created_idx
on public.cart_items(user_id, created_at desc);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;
revoke all on table public.cart_items from anon, authenticated;
grant select on table public.cart_items to authenticated;

create policy cart_items_select_own
on public.cart_items for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.create_catalog_checkout_order(
  p_user_id uuid,
  p_payment_method_id uuid,
  p_items jsonb,
  p_customer_note text,
  p_idempotency_key uuid
)
returns table (order_id uuid, order_number text, payment_id uuid, total numeric, currency text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_order_number text;
  v_currency text;
  v_rate numeric;
  v_default_margin numeric;
  v_total numeric(12,2) := 0;
  v_existing_total numeric(12,2);
  v_is_active boolean;
  v_recent_orders integer;
  v_item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_suboption_id uuid;
  v_quantity integer;
  v_customer_inputs jsonb;
  v_product_name text;
  v_variant_name text;
  v_suboption_name text;
  v_selected_usd numeric;
  v_margin numeric;
  v_unit_price numeric(12,2);
  v_product_requires_suboption boolean;
  v_requires_suboption boolean;
  v_suboption_usd numeric;
  v_suboption_global boolean;
  v_suboption_mode text;
  v_suboption_parent_variant uuid;
  v_suboption_parent_product uuid;
  v_suboption_parent_sku text;
begin
  if p_user_id is null or p_payment_method_id is null or p_idempotency_key is null then
    raise exception 'invalid_catalog_checkout_input';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'invalid_catalog_checkout_items';
  end if;

  select o.id, o.order_number, o.total, o.currency
    into v_order_id, v_order_number, v_existing_total, v_currency
  from public.orders o
  where o.user_id = p_user_id and o.idempotency_key = p_idempotency_key;

  if found then
    select p.id into v_payment_id
    from public.payments p
    where p.order_id = v_order_id
    order by p.created_at desc
    limit 1;
    return query select v_order_id, v_order_number, v_payment_id, v_existing_total, v_currency;
    return;
  end if;

  select p.is_active into v_is_active
  from public.profiles p
  where p.id = p_user_id;
  if not found or v_is_active is not true then
    raise exception 'inactive_or_missing_user';
  end if;

  select count(*)::integer into v_recent_orders
  from public.orders o
  where o.user_id = p_user_id
    and o.created_at >= now() - interval '10 minutes';
  if v_recent_orders >= 5 then
    raise exception 'checkout_rate_limited';
  end if;

  perform 1
  from public.payment_methods pm
  where pm.id = p_payment_method_id
    and pm.status = 'active'::public.product_status;
  if not found then
    raise exception 'payment_method_unavailable';
  end if;

  select ss.usd_to_sdg_rate, ss.default_profit_margin, ss.currency
    into v_rate, v_default_margin, v_currency
  from public.store_settings ss
  where ss.id = 1;
  if not found or v_rate <= 0 then
    raise exception 'exchange_rate_not_configured';
  end if;

  v_order_number := 'RZ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  begin
    insert into public.orders (
      order_number,
      user_id,
      status,
      currency,
      subtotal,
      total,
      customer_note,
      idempotency_key
    ) values (
      v_order_number,
      p_user_id,
      'pending_payment'::public.order_status,
      v_currency,
      0,
      0,
      nullif(left(trim(coalesce(p_customer_note, '')), 500), ''),
      p_idempotency_key
    ) returning id into v_order_id;
  exception when unique_violation then
    select o.id, o.order_number, o.total, o.currency
      into v_order_id, v_order_number, v_existing_total, v_currency
    from public.orders o
    where o.user_id = p_user_id and o.idempotency_key = p_idempotency_key;
    select p.id into v_payment_id
    from public.payments p
    where p.order_id = v_order_id
    order by p.created_at desc
    limit 1;
    return query select v_order_id, v_order_number, v_payment_id, v_existing_total, v_currency;
    return;
  end;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := nullif(v_item ->> 'product_id', '')::uuid;
    v_variant_id := nullif(v_item ->> 'variant_id', '')::uuid;
    v_suboption_id := nullif(v_item ->> 'suboption_id', '')::uuid;
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 1);
    v_customer_inputs := coalesce(v_item -> 'customer_inputs', '{}'::jsonb);

    if v_product_id is null or v_quantity < 1 or v_quantity > 100 or jsonb_typeof(v_customer_inputs) <> 'object' then
      raise exception 'invalid_catalog_line';
    end if;

    select
      pr.name,
      pr.base_price_usd,
      coalesce(pr.profit_margin_override, v_default_margin),
      pr.suboptions_required
      into v_product_name, v_selected_usd, v_margin, v_product_requires_suboption
    from public.products pr
    join public.subcategories s on s.id = pr.subcategory_id
    join public.categories c on c.id = s.category_id
    where pr.id = v_product_id
      and pr.status = 'active'::public.product_status
      and pr.subcategory_id is not null
      and s.status = 'active'::public.product_status
      and c.status = 'active'::public.product_status;
    if not found then
      raise exception 'catalog_product_unavailable';
    end if;

    v_variant_name := null;
    v_suboption_name := null;
    v_requires_suboption := v_product_requires_suboption;

    if v_variant_id is not null then
      select pv.name, pv.price_usd, pv.suboptions_required
        into v_variant_name, v_selected_usd, v_requires_suboption
      from public.product_variants pv
      where pv.id = v_variant_id
        and pv.product_id = v_product_id
        and pv.status = 'active'::public.product_status
        and coalesce(pv.sku, '') <> '__BASE__';
      if not found then
        raise exception 'catalog_variant_unavailable';
      end if;
    end if;

    if v_suboption_id is not null then
      select
        so.name,
        so.price_usd,
        so.applies_to_all_variants,
        so.price_mode,
        pv.id,
        pv.product_id,
        pv.sku
        into
          v_suboption_name,
          v_suboption_usd,
          v_suboption_global,
          v_suboption_mode,
          v_suboption_parent_variant,
          v_suboption_parent_product,
          v_suboption_parent_sku
      from public.product_suboptions so
      join public.product_variants pv on pv.id = so.variant_id
      where so.id = v_suboption_id
        and so.status = 'active'::public.product_status
        and pv.status = 'active'::public.product_status;
      if not found or v_suboption_parent_product <> v_product_id then
        raise exception 'catalog_suboption_unavailable';
      end if;

      if v_suboption_global then
        if coalesce(v_suboption_parent_sku, '') <> '__BASE__' or v_suboption_mode <> 'delta' then
          raise exception 'invalid_global_suboption';
        end if;
        v_selected_usd := v_selected_usd + v_suboption_usd;
      else
        if v_variant_id is null then
          if coalesce(v_suboption_parent_sku, '') <> '__BASE__' then
            raise exception 'catalog_suboption_mismatch';
          end if;
        elsif v_suboption_parent_variant <> v_variant_id then
          raise exception 'catalog_suboption_mismatch';
        end if;

        if v_suboption_mode = 'delta' then
          v_selected_usd := v_selected_usd + v_suboption_usd;
        else
          v_selected_usd := v_suboption_usd;
        end if;
      end if;
    elsif v_requires_suboption then
      raise exception 'catalog_suboption_required';
    end if;

    if exists (
      select 1
      from public.product_input_fields f
      where f.product_id = v_product_id
        and f.status = 'active'::public.product_status
        and f.is_required = true
        and nullif(trim(coalesce(v_customer_inputs ->> f.field_key, '')), '') is null
    ) then
      raise exception 'catalog_required_input_missing';
    end if;

    if exists (
      select 1
      from public.product_input_fields f
      where f.product_id = v_product_id
        and f.status = 'active'::public.product_status
        and nullif(v_customer_inputs ->> f.field_key, '') is not null
        and (
          (f.min_length is not null and char_length(v_customer_inputs ->> f.field_key) < f.min_length)
          or
          (f.max_length is not null and char_length(v_customer_inputs ->> f.field_key) > f.max_length)
        )
    ) then
      raise exception 'catalog_input_length_invalid';
    end if;

    v_unit_price := round(v_selected_usd * v_rate * (1 + v_margin), 2);
    v_total := v_total + (v_unit_price * v_quantity);

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      variant_id,
      suboption_id,
      variant_name,
      suboption_name,
      customer_inputs
    ) values (
      v_order_id,
      v_product_id,
      v_product_name,
      v_unit_price,
      v_quantity,
      v_variant_id,
      v_suboption_id,
      v_variant_name,
      v_suboption_name,
      v_customer_inputs
    );
  end loop;

  update public.orders
  set subtotal = v_total,
      total = v_total,
      updated_at = now()
  where id = v_order_id;

  insert into public.payments (order_id, payment_method_id, amount, currency, status)
  values (v_order_id, p_payment_method_id, v_total, v_currency, 'pending'::public.payment_status)
  returning id into v_payment_id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (v_order_id, null, 'pending_payment'::public.order_status, p_user_id, 'catalog_order_created');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    p_user_id,
    'order.catalog_created',
    'order',
    v_order_id,
    jsonb_build_object(
      'payment_id', v_payment_id,
      'line_count', jsonb_array_length(p_items),
      'idempotency_key', p_idempotency_key
    )
  );

  return query select v_order_id, v_order_number, v_payment_id, v_total, v_currency;
end;
$$;

revoke all on function public.create_catalog_checkout_order(uuid, uuid, jsonb, text, uuid)
from public, anon, authenticated;
grant execute on function public.create_catalog_checkout_order(uuid, uuid, jsonb, text, uuid)
to service_role;

comment on column public.product_variants.suboptions_required is
'Controls whether the selected variant requires a child suboption; this is independent per 60/325/660-style choice.';
comment on column public.product_suboptions.applies_to_all_variants is
'When true, the suboption is attached to the internal base variant and is offered for every visible variant.';
comment on column public.product_suboptions.price_mode is
'absolute means the suboption USD price replaces the selected variant; delta means it is added to the selected variant price.';
comment on table public.cart_items is
'Persistent account cart containing only catalog selection identifiers and quantity; prices are never stored or trusted here.';

notify pgrst, 'reload schema';
