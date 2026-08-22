alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create or replace function public.admin_review_payment(
  p_admin_id uuid,
  p_payment_id uuid,
  p_decision text,
  p_review_reason text
)
returns table (
  order_id uuid,
  order_number text,
  order_status public.order_status,
  payment_status public.payment_status
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_old_order_status public.order_status;
  v_new_order_status public.order_status;
  v_new_payment_status public.payment_status;
  v_new_receipt_status public.receipt_status;
  v_is_admin boolean;
begin
  select (p.role = 'admin'::public.user_role and p.is_active = true)
    into v_is_admin
  from public.profiles p
  where p.id = p_admin_id;

  if not found or v_is_admin is not true then raise exception 'admin_required'; end if;

  if p_decision = 'confirm' then
    v_new_payment_status := 'confirmed'::public.payment_status;
    v_new_order_status := 'paid'::public.order_status;
    v_new_receipt_status := 'approved'::public.receipt_status;
  elsif p_decision = 'reject' then
    v_new_payment_status := 'rejected'::public.payment_status;
    v_new_order_status := 'rejected'::public.order_status;
    v_new_receipt_status := 'rejected'::public.receipt_status;
  else
    raise exception 'invalid_review_decision';
  end if;

  select o.id,o.order_number,o.status into v_order_id,v_order_number,v_old_order_status
  from public.payments p join public.orders o on o.id=p.order_id
  where p.id=p_payment_id and p.status='under_review'::public.payment_status;
  if not found then raise exception 'payment_not_under_review'; end if;

  update public.payments
  set status=v_new_payment_status,reviewed_at=now(),reviewed_by=p_admin_id,updated_at=now()
  where id=p_payment_id;

  update public.payment_receipts
  set status=v_new_receipt_status,
      review_reason=nullif(left(trim(coalesce(p_review_reason,'')),500),''),
      updated_at=now()
  where id=(
    select r.id from public.payment_receipts r
    where r.payment_id=p_payment_id
      and r.status in ('pending'::public.receipt_status,'processing'::public.receipt_status,'manual_review'::public.receipt_status)
    order by r.created_at desc limit 1
  );

  update public.orders
  set status=v_new_order_status,
      admin_note=case when nullif(left(trim(coalesce(p_review_reason,'')),500),'') is null then admin_note else nullif(left(trim(coalesce(p_review_reason,'')),500),'') end,
      updated_at=now()
  where id=v_order_id;

  if v_old_order_status is distinct from v_new_order_status then
    insert into public.order_status_history (order_id,from_status,to_status,changed_by,note)
    values (v_order_id,v_old_order_status,v_new_order_status,p_admin_id,case when p_decision='confirm' then 'payment_confirmed' else 'payment_rejected' end);
  end if;

  insert into public.audit_logs (actor_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,case when p_decision='confirm' then 'payment.confirmed' else 'payment.rejected' end,'payment',p_payment_id,jsonb_build_object('order_id',v_order_id,'reason',nullif(left(trim(coalesce(p_review_reason,'')),500),'')));

  return query select v_order_id,v_order_number,v_new_order_status,v_new_payment_status;
end;
$$;

revoke all on function public.admin_review_payment(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.admin_review_payment(uuid, uuid, text, text) to service_role;
