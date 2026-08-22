create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','admin');
create type public.product_status as enum ('active','inactive','archived');
create type public.order_status as enum ('pending_payment','payment_review','paid','processing','completed','cancelled','refunded','rejected');
create type public.payment_status as enum ('pending','under_review','confirmed','rejected','refunded');
create type public.receipt_status as enum ('pending','processing','approved','rejected','manual_review');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  status public.product_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'SDG' check (char_length(currency) between 3 and 5),
  status public.product_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  instructions text,
  account_label text,
  account_identifier text,
  status public.product_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending_payment',
  currency text not null default 'SDG',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  customer_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null default 1 check (quantity > 0 and quantity <= 100),
  line_total numeric(12,2) generated always as (unit_price * quantity) stored,
  player_id text,
  player_name text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'SDG',
  status public.payment_status not null default 'pending',
  transaction_reference text,
  paid_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  storage_path text not null unique,
  original_filename text,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes > 0),
  status public.receipt_status not null default 'pending',
  extracted_amount numeric(12,2),
  extracted_reference text,
  extracted_at timestamptz,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index products_game_id_idx on public.products(game_id);
create index products_status_idx on public.products(status);
create index payments_order_id_idx on public.payments(order_id);
create index payments_status_idx on public.payments(status);
create index receipts_payment_id_idx on public.payment_receipts(payment_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_created_at_idx on public.notifications(created_at desc);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger games_set_updated_at before update on public.games for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger payment_methods_set_updated_at before update on public.payment_methods for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger receipts_set_updated_at before update on public.payment_receipts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.products enable row level security;
alter table public.payment_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "games_public_read_active" on public.games for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "games_admin_write" on public.games for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_public_read_active" on public.products for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "products_admin_write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "payment_methods_public_read_active" on public.payment_methods for select to anon, authenticated using (status = 'active' or public.is_admin());
create policy "payment_methods_admin_write" on public.payment_methods for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "orders_select_own_or_admin" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "orders_insert_own" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "orders_admin_update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "order_items_select_owner_or_admin" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "order_items_insert_owner" on public.order_items for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_admin_write" on public.order_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "payments_select_owner_or_admin" on public.payments for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "payments_insert_owner" on public.payments for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "payments_admin_update" on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "receipts_select_owner_or_admin" on public.payment_receipts for select to authenticated using (exists (select 1 from public.payments p join public.orders o on o.id = p.order_id where p.id = payment_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "receipts_insert_owner" on public.payment_receipts for insert to authenticated with check (exists (select 1 from public.payments p join public.orders o on o.id = p.order_id where p.id = payment_id and o.user_id = auth.uid()));
create policy "receipts_admin_update" on public.payment_receipts for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "notifications_select_own_or_admin" on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "notifications_admin_write" on public.notifications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "notifications_update_own_read_state" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "audit_logs_admin_read" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "audit_logs_admin_write" on public.audit_logs for insert to authenticated with check (public.is_admin());

revoke all on public.audit_logs from anon, authenticated;
revoke all on public.payment_receipts from anon;
