alter table public.orders
  add column if not exists idempotency_key uuid;

create unique index if not exists orders_user_id_idempotency_key_idx
  on public.orders(user_id, idempotency_key)
  where idempotency_key is not null;

drop function if exists public.create_checkout_order(uuid, uuid, uuid, text, text, text);

create function public.create_checkout_order(
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
begin
  if p_user_id is null or p_product_id is null or p_payment_method_id is null or p_idempotency_key is null then
    raise exception 'invalid_checkout_input';
  end if;

  select o.id, o.order_number, o.total, o.currency into v_order_id, v_order_number, v_price, v_currency
  from public.orders o
  where o.user_id = p_user_id and o.idempotency_key = p_idempotency_key;

  if found then
    select p.id into v_payment_id from public.payments p where p.order_id = v_order_id order by p.created_at desc limit 1;
    return query select v_order_id, v_order_number, v_payment_id, v_price, v_currency;
    return;
  end if;

  select p.is_active into v_is_active from public.profiles p where p.id = p_user_id;
  if not found or v_is_active is not true then raise exception 'inactive_or_missing_user'; end if;

  select count(*)::integer into v_recent_orders
  from public.orders o
  where o.user_id = p_user_id and o.created_at >= now() - interval '10 minutes';
  if v_recent_orders >= 5 then raise exception 'checkout_rate_limited'; end if;

  select pr.name, pr.price, pr.currency into v_product_name, v_price, v_currency
  from public.products pr
  where pr.id = p_product_id and pr.status = 'active'::public.product_status;
  if not found then raise exception 'product_unavailable'; end if;

  perform 1 from public.payment_methods pm
  where pm.id = p_payment_method_id and pm.status = 'active'::public.product_status;
  if not found then raise exception 'payment_method_unavailable'; end if;

  v_order_number := 'RZ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  begin
    insert into public.orders (order_number,user_id,status,currency,subtotal,total,customer_note,idempotency_key)
    values (v_order_number,p_user_id,'pending_payment'::public.order_status,v_currency,v_price,v_price,nullif(left(trim(coalesce(p_customer_note,'')),500),''),p_idempotency_key)
    returning id into v_order_id;
  exception when unique_violation then
    select o.id,o.order_number,o.total,o.currency into v_order_id,v_order_number,v_price,v_currency
    from public.orders o where o.user_id=p_user_id and o.idempotency_key=p_idempotency_key;
    select p.id into v_payment_id from public.payments p where p.order_id=v_order_id order by p.created_at desc limit 1;
    return query select v_order_id,v_order_number,v_payment_id,v_price,v_currency;
    return;
  end;

  insert into public.order_items (order_id,product_id,product_name,unit_price,quantity,player_id,player_name)
  values (v_order_id,p_product_id,v_product_name,v_price,1,nullif(left(trim(coalesce(p_player_id,'')),120),''),nullif(left(trim(coalesce(p_player_name,'')),120),''));

  insert into public.payments (order_id,payment_method_id,amount,currency,status)
  values (v_order_id,p_payment_method_id,v_price,v_currency,'pending'::public.payment_status)
  returning id into v_payment_id;

  insert into public.order_status_history (order_id,from_status,to_status,changed_by,note)
  values (v_order_id,null,'pending_payment'::public.order_status,p_user_id,'order_created');

  insert into public.audit_logs (actor_id,action,entity_type,entity_id,metadata)
  values (p_user_id,'order.created','order',v_order_id,jsonb_build_object('payment_id',v_payment_id,'product_id',p_product_id,'idempotency_key',p_idempotency_key));

  return query select v_order_id,v_order_number,v_payment_id,v_price,v_currency;
end;
$$;

revoke all on function public.create_checkout_order(uuid, uuid, uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid, uuid, uuid, text, text, text, uuid) to service_role;
