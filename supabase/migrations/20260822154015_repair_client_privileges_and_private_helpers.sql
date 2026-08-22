create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.user_role
      and p.is_active = true
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter policy profiles_select_own_or_admin on public.profiles
  using ((id = (select auth.uid())) or private.is_admin());
alter policy profiles_update_own_or_admin on public.profiles
  using ((id = (select auth.uid())) or private.is_admin())
  with check ((id = (select auth.uid())) or private.is_admin());

alter policy games_admin_write on public.games
  using (private.is_admin()) with check (private.is_admin());
alter policy games_public_read_active on public.games
  using ((status = 'active'::public.product_status) or private.is_admin());

alter policy products_admin_write on public.products
  using (private.is_admin()) with check (private.is_admin());
alter policy products_public_read_active on public.products
  using ((status = 'active'::public.product_status) or private.is_admin());

alter policy payment_methods_admin_write on public.payment_methods
  using (private.is_admin()) with check (private.is_admin());
alter policy payment_methods_public_read_active on public.payment_methods
  using ((status = 'active'::public.product_status) or private.is_admin());

alter policy orders_admin_update on public.orders
  using (private.is_admin()) with check (private.is_admin());
alter policy orders_select_own_or_admin on public.orders
  using ((user_id = (select auth.uid())) or private.is_admin());

alter policy order_items_admin_write on public.order_items
  using (private.is_admin()) with check (private.is_admin());
alter policy order_items_select_owner_or_admin on public.order_items
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  ));

alter policy payments_admin_update on public.payments
  using (private.is_admin()) with check (private.is_admin());
alter policy payments_select_owner_or_admin on public.payments
  using (exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  ));

alter policy receipts_admin_update on public.payment_receipts
  using (private.is_admin()) with check (private.is_admin());
alter policy receipts_select_owner_or_admin on public.payment_receipts
  using (exists (
    select 1
    from public.payments p
    join public.orders o on o.id = p.order_id
    where p.id = payment_receipts.payment_id
      and (o.user_id = (select auth.uid()) or private.is_admin())
  ));

alter policy notifications_admin_write on public.notifications
  using (private.is_admin()) with check (private.is_admin());
alter policy notifications_select_own_or_admin on public.notifications
  using ((user_id = (select auth.uid())) or private.is_admin());
alter policy notifications_update_own_read_state on public.notifications
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy audit_logs_admin_read on public.audit_logs
  using (private.is_admin());
alter policy audit_logs_admin_write on public.audit_logs
  with check (private.is_admin());

drop policy if exists orders_insert_own on public.orders;
drop policy if exists order_items_insert_owner on public.order_items;
drop policy if exists payments_insert_owner on public.payments;
drop policy if exists receipts_insert_owner on public.payment_receipts;

revoke all privileges on all tables in schema public from anon, authenticated;

grant select on public.games, public.products to anon, authenticated;

grant select on public.profiles, public.payment_methods, public.orders,
  public.order_items, public.payments, public.payment_receipts,
  public.notifications to authenticated;

grant update (display_name, phone) on public.profiles to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists payment_methods_public_read_active on public.payment_methods;
create policy payment_methods_authenticated_read_active
on public.payment_methods
for select
to authenticated
using ((status = 'active'::public.product_status) or private.is_admin());

create table if not exists public.store_settings (
  id smallint primary key default 1 check (id = 1),
  usd_to_sdg_rate numeric(18,4) not null default 0 check (usd_to_sdg_rate >= 0),
  default_profit_margin numeric(7,4) not null default 0 check (default_profit_margin >= 0 and default_profit_margin <= 1),
  currency text not null default 'SDG',
  updated_at timestamptz not null default now(),
  updated_by uuid null references public.profiles(id) on delete set null
);

alter table public.store_settings enable row level security;
revoke all on public.store_settings from anon, authenticated;
grant select on public.store_settings to anon, authenticated;

create policy store_settings_read
on public.store_settings
for select
to anon, authenticated
using (true);

insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do update set public = false;

create policy receipt_objects_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-receipts'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin())
);

create policy receipt_objects_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop function if exists public.is_admin();
drop function if exists public.handle_new_user();
