create or replace function public.admin_progress_order(
  p_admin_id uuid,
  p_order_id uuid,
  p_next_status public.order_status,
  p_note text
)
returns table (
  order_id uuid,
  order_number text,
  order_status public.order_status
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_is_admin boolean;
  v_order_number text;
  v_old_status public.order_status;
begin
  select (p.role = 'admin'::public.user_role and p.is_active = true)
    into v_is_admin
  from public.profiles p
  where p.id = p_admin_id;

  if not found or v_is_admin is not true then raise exception 'admin_required'; end if;

  select o.order_number,o.status into v_order_number,v_old_status
  from public.orders o where o.id=p_order_id;
  if not found then raise exception 'order_not_found'; end if;

  if not (
    (v_old_status='paid'::public.order_status and p_next_status='processing'::public.order_status)
    or (v_old_status='processing'::public.order_status and p_next_status='completed'::public.order_status)
  ) then raise exception 'invalid_order_transition'; end if;

  update public.orders
  set status=p_next_status,
      admin_note=case when nullif(left(trim(coalesce(p_note,'')),500),'') is null then admin_note else nullif(left(trim(coalesce(p_note,'')),500),'') end,
      updated_at=now()
  where id=p_order_id;

  insert into public.order_status_history (order_id,from_status,to_status,changed_by,note)
  values (p_order_id,v_old_status,p_next_status,p_admin_id,coalesce(nullif(left(trim(coalesce(p_note,'')),500),''),'admin_progress'));

  insert into public.audit_logs (actor_id,action,entity_type,entity_id,metadata)
  values (p_admin_id,'order.status_changed','order',p_order_id,jsonb_build_object('from',v_old_status,'to',p_next_status));

  return query select p_order_id,v_order_number,p_next_status;
end;
$$;

revoke all on function public.admin_progress_order(uuid, uuid, public.order_status, text) from public, anon, authenticated;
grant execute on function public.admin_progress_order(uuid, uuid, public.order_status, text) to service_role;
