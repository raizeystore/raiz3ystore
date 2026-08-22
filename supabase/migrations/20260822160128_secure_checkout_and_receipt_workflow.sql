create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_created_at_idx
  on public.order_status_history(order_id, created_at desc);

alter table public.order_status_history enable row level security;
revoke all on public.order_status_history from anon, authenticated;
grant select on public.order_status_history to authenticated;

create policy order_status_history_select_own_or_admin
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  )
);

create or replace function public.create_checkout_order(
  p_user_id uuid,
  p_product_id uuid,
  p_payment_method_id uuid,
  p_player_id text,
  p_player_name text,
  p_customer_note text
)
returns table (
  order_id uuid,
  order_number text,
  payment_id uuid,
  total numeric,
  currency text
)
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
begin
  if p_user_id is null or p_product_id is null or p_payment_method_id is null then
    raise exception 'invalid_checkout_input';
  end if;

  select p.is_active into v_is_active
  from public.profiles p
  where p.id = p_user_id;

  if not found or v_is_active is not true then
    raise exception 'inactive_or_missing_user';
  end if;

  select pr.name, pr.price, pr.currency
    into v_product_name, v_price, v_currency
  from public.products pr
  where pr.id = p_product_id
    and pr.status = 'active'::public.product_status;

  if not found then raise exception 'product_unavailable'; end if;

  perform 1 from public.payment_methods pm
  where pm.id = p_payment_method_id
    and pm.status = 'active'::public.product_status;

  if not found then raise exception 'payment_method_unavailable'; end if;

  v_order_number := 'RZ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (order_number,user_id,status,currency,subtotal,total,customer_note)
  values (v_order_number,p_user_id,'pending_payment'::public.order_status,v_currency,v_price,v_price,nullif(left(trim(coalesce(p_customer_note, '')),500),''))
  returning id into v_order_id;

  insert into public.order_items (order_id,product_id,product_name,unit_price,quantity,player_id,player_name)
  values (v_order_id,p_product_id,v_product_name,v_price,1,nullif(left(trim(coalesce(p_player_id, '')),120),''),nullif(left(trim(coalesce(p_player_name, '')),120),''));

  insert into public.payments (order_id,payment_method_id,amount,currency,status)
  values (v_order_id,p_payment_method_id,v_price,v_currency,'pending'::public.payment_status)
  returning id into v_payment_id;

  insert into public.order_status_history (order_id,from_status,to_status,changed_by,note)
  values (v_order_id,null,'pending_payment'::public.order_status,p_user_id,'order_created');

  insert into public.audit_logs (actor_id,action,entity_type,entity_id,metadata)
  values (p_user_id,'order.created','order',v_order_id,jsonb_build_object('payment_id',v_payment_id,'product_id',p_product_id));

  return query select v_order_id,v_order_number,v_payment_id,v_price,v_currency;
end;
$$;

revoke all on function public.create_checkout_order(uuid, uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid, uuid, uuid, text, text, text) to service_role;

create or replace function public.submit_payment_receipt(
  p_user_id uuid,
  p_payment_id uuid,
  p_storage_path text,
  p_original_filename text,
  p_mime_type text,
  p_file_size_bytes bigint
)
returns table (receipt_id uuid, order_id uuid, order_number text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_receipt_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_order_status public.order_status;
begin
  if p_user_id is null or p_payment_id is null or nullif(trim(coalesce(p_storage_path,'')),'') is null then
    raise exception 'invalid_receipt_input';
  end if;
  if p_file_size_bytes is null or p_file_size_bytes <= 0 or p_file_size_bytes > 5242880 then
    raise exception 'invalid_receipt_size';
  end if;
  if p_mime_type not in ('image/jpeg','image/png','image/webp','application/pdf') then
    raise exception 'invalid_receipt_type';
  end if;

  select o.id,o.order_number,o.status into v_order_id,v_order_number,v_order_status
  from public.payments p join public.orders o on o.id=p.order_id
  where p.id=p_payment_id and o.user_id=p_user_id
    and p.status in ('pending'::public.payment_status,'rejected'::public.payment_status);
  if not found then raise exception 'payment_not_eligible'; end if;

  if exists (
    select 1 from public.payment_receipts r
    where r.payment_id=p_payment_id
      and r.status in ('pending'::public.receipt_status,'processing'::public.receipt_status,'approved'::public.receipt_status,'manual_review'::public.receipt_status)
  ) then raise exception 'receipt_already_active'; end if;

  insert into public.payment_receipts (payment_id,storage_path,original_filename,mime_type,file_size_bytes,status)
  values (p_payment_id,left(p_storage_path,500),nullif(left(trim(coalesce(p_original_filename,'')),255),''),p_mime_type,p_file_size_bytes,'pending'::public.receipt_status)
  returning id into v_receipt_id;

  update public.payments set status='under_review'::public.payment_status,updated_at=now() where id=p_payment_id;

  if v_order_status <> 'payment_review'::public.order_status then
    update public.orders set status='payment_review'::public.order_status,updated_at=now() where id=v_order_id;
    insert into public.order_status_history (order_id,from_status,to_status,changed_by,note)
    values (v_order_id,v_order_status,'payment_review'::public.order_status,p_user_id,'receipt_submitted');
  end if;

  insert into public.audit_logs (actor_id,action,entity_type,entity_id,metadata)
  values (p_user_id,'payment.receipt_submitted','payment',p_payment_id,jsonb_build_object('receipt_id',v_receipt_id,'order_id',v_order_id));

  return query select v_receipt_id,v_order_id,v_order_number;
end;
$$;

revoke all on function public.submit_payment_receipt(uuid, uuid, text, text, text, bigint) from public, anon, authenticated;
grant execute on function public.submit_payment_receipt(uuid, uuid, text, text, text, bigint) to service_role;
