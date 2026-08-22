alter table public.products
  add column if not exists pricing_mode text not null default 'manual',
  add column if not exists base_price_usd numeric(12,4),
  add column if not exists profit_margin_override numeric(7,4),
  add column if not exists player_id_required boolean not null default true,
  add column if not exists player_name_required boolean not null default false,
  add column if not exists player_id_label text not null default 'Player ID',
  add column if not exists player_name_label text not null default 'اسم اللاعب';

alter table public.products
  drop constraint if exists products_pricing_mode_check,
  add constraint products_pricing_mode_check check (pricing_mode in ('manual', 'usd_auto')),
  drop constraint if exists products_base_price_usd_check,
  add constraint products_base_price_usd_check check (base_price_usd is null or base_price_usd >= 0),
  drop constraint if exists products_profit_margin_override_check,
  add constraint products_profit_margin_override_check check (profit_margin_override is null or (profit_margin_override >= 0 and profit_margin_override <= 1)),
  drop constraint if exists products_auto_price_requires_base_check,
  add constraint products_auto_price_requires_base_check check (pricing_mode <> 'usd_auto' or base_price_usd is not null),
  drop constraint if exists products_player_id_label_check,
  add constraint products_player_id_label_check check (char_length(trim(player_id_label)) between 1 and 80),
  drop constraint if exists products_player_name_label_check,
  add constraint products_player_name_label_check check (char_length(trim(player_name_label)) between 1 and 80);

create or replace function private.apply_product_pricing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rate numeric(18,4);
  v_default_margin numeric(7,4);
  v_currency text;
  v_margin numeric(7,4);
begin
  if new.pricing_mode = 'usd_auto' then
    if new.base_price_usd is null then raise exception 'base_price_usd_required'; end if;

    select s.usd_to_sdg_rate, s.default_profit_margin, s.currency
      into v_rate, v_default_margin, v_currency
    from public.store_settings s
    where s.id = 1;

    if not found or v_rate is null or v_rate <= 0 then
      raise exception 'exchange_rate_not_configured';
    end if;

    v_margin := coalesce(new.profit_margin_override, v_default_margin, 0);
    new.price := round((new.base_price_usd * v_rate * (1 + v_margin))::numeric, 2);
    new.currency := coalesce(nullif(trim(v_currency), ''), 'SDG');
  end if;

  return new;
end;
$$;

revoke all on function private.apply_product_pricing() from public, anon, authenticated;

drop trigger if exists products_apply_pricing on public.products;
create trigger products_apply_pricing
before insert or update of pricing_mode, base_price_usd, profit_margin_override
on public.products
for each row execute function private.apply_product_pricing();

create or replace function private.reprice_products_after_settings_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.usd_to_sdg_rate <= 0 and exists (
    select 1 from public.products p where p.pricing_mode = 'usd_auto'
  ) then
    raise exception 'exchange_rate_must_be_positive_for_auto_products';
  end if;

  if new.usd_to_sdg_rate > 0 then
    update public.products p
    set price = round((
          p.base_price_usd * new.usd_to_sdg_rate
          * (1 + coalesce(p.profit_margin_override, new.default_profit_margin, 0))
        )::numeric, 2),
        currency = coalesce(nullif(trim(new.currency), ''), 'SDG'),
        updated_at = now()
    where p.pricing_mode = 'usd_auto'
      and p.base_price_usd is not null;
  end if;

  return new;
end;
$$;

revoke all on function private.reprice_products_after_settings_change() from public, anon, authenticated;

drop trigger if exists store_settings_reprice_products on public.store_settings;
create trigger store_settings_reprice_products
after insert or update of usd_to_sdg_rate, default_profit_margin, currency
on public.store_settings
for each row execute function private.reprice_products_after_settings_change();

create or replace function public.create_checkout_order(
  p_user_id uuid,
  p_product_id uuid,
  p_payment_method_id uuid,
  p_player_id text,
  p_player_name text,
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
  v_product_name text;
  v_price numeric(12,2);
  v_currency text;
  v_is_active boolean;
  v_recent_orders integer;
  v_player_id_required boolean;
  v_player_name_required boolean;
begin
  if p_user_id is null or p_product_id is null or p_payment_method_id is null or p_idempotency_key is null then
    raise exception 'invalid_checkout_input';
  end if;

  select o.id, o.order_number, o.total, o.currency
    into v_order_id, v_order_number, v_price, v_currency
  from public.orders o
  where o.user_id = p_user_id and o.idempotency_key = p_idempotency_key;

  if found then
    select p.id into v_payment_id from public.payments p
    where p.order_id = v_order_id order by p.created_at desc limit 1;
    return query select v_order_id, v_order_number, v_payment_id, v_price, v_currency;
    return;
  end if;

  select p.is_active into v_is_active from public.profiles p where p.id = p_user_id;
  if not found or v_is_active is not true then raise exception 'inactive_or_missing_user'; end if;

  select count(*)::integer into v_recent_orders
  from public.orders o
  where o.user_id = p_user_id and o.created_at >= now() - interval '10 minutes';
  if v_recent_orders >= 5 then raise exception 'checkout_rate_limited'; end if;

  select pr.name, pr.price, pr.currency, pr.player_id_required, pr.player_name_required
    into v_product_name, v_price, v_currency, v_player_id_required, v_player_name_required
  from public.products pr
  where pr.id = p_product_id and pr.status = 'active'::public.product_status;
  if not found then raise exception 'product_unavailable'; end if;

  if v_player_id_required and nullif(trim(coalesce(p_player_id, '')), '') is null then
    raise exception 'player_id_required';
  end if;
  if v_player_name_required and nullif(trim(coalesce(p_player_name, '')), '') is null then
    raise exception 'player_name_required';
  end if;

  perform 1 from public.payment_methods pm
  where pm.id = p_payment_method_id and pm.status = 'active'::public.product_status;
  if not found then raise exception 'payment_method_unavailable'; end if;

  v_order_number := 'RZ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  begin
    insert into public.orders (order_number, user_id, status, currency, subtotal, total, customer_note, idempotency_key)
    values (v_order_number, p_user_id, 'pending_payment'::public.order_status, v_currency, v_price, v_price,
      nullif(left(trim(coalesce(p_customer_note, '')), 500), ''), p_idempotency_key)
    returning id into v_order_id;
  exception when unique_violation then
    select o.id, o.order_number, o.total, o.currency
      into v_order_id, v_order_number, v_price, v_currency
    from public.orders o where o.user_id = p_user_id and o.idempotency_key = p_idempotency_key;
    select p.id into v_payment_id from public.payments p
    where p.order_id = v_order_id order by p.created_at desc limit 1;
    return query select v_order_id, v_order_number, v_payment_id, v_price, v_currency;
    return;
  end;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, player_id, player_name)
  values (v_order_id, p_product_id, v_product_name, v_price, 1,
    nullif(left(trim(coalesce(p_player_id, '')), 120), ''),
    nullif(left(trim(coalesce(p_player_name, '')), 120), ''));

  insert into public.payments (order_id, payment_method_id, amount, currency, status)
  values (v_order_id, p_payment_method_id, v_price, v_currency, 'pending'::public.payment_status)
  returning id into v_payment_id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (v_order_id, null, 'pending_payment'::public.order_status, p_user_id, 'order_created');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (p_user_id, 'order.created', 'order', v_order_id,
    jsonb_build_object('payment_id', v_payment_id, 'product_id', p_product_id, 'idempotency_key', p_idempotency_key));

  return query select v_order_id, v_order_number, v_payment_id, v_price, v_currency;
end;
$$;

revoke all on function public.create_checkout_order(uuid, uuid, uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid, uuid, uuid, text, text, text, uuid) to service_role;
