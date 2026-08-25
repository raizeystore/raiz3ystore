create table if not exists public.wallet_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(18,2) not null default 0 check (balance >= 0),
  currency text not null default 'SDG' check (currency = 'SDG'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallet_accounts enable row level security;
revoke all on table public.wallet_accounts from anon;
revoke insert, update, delete on table public.wallet_accounts from authenticated;
grant select on table public.wallet_accounts to authenticated;

drop policy if exists wallet_accounts_select_own on public.wallet_accounts;
create policy wallet_accounts_select_own
on public.wallet_accounts
for select
to authenticated
using (user_id = (select auth.uid()));

insert into public.wallet_accounts (user_id)
select p.id from public.profiles p
on conflict (user_id) do nothing;

create or replace function private.ensure_wallet_account_for_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wallet_accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.ensure_wallet_account_for_profile() from public, anon, authenticated;

drop trigger if exists profiles_create_wallet_account on public.profiles;
create trigger profiles_create_wallet_account
after insert on public.profiles
for each row execute function private.ensure_wallet_account_for_profile();

create table if not exists public.ticker_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(trim(message)) between 2 and 180),
  status public.product_status not null default 'active'::public.product_status,
  sort_order integer not null default 0 check (sort_order >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticker_messages_time_window check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create index if not exists ticker_messages_public_order_idx
  on public.ticker_messages (status, sort_order, created_at);

alter table public.ticker_messages enable row level security;
revoke insert, update, delete on table public.ticker_messages from anon, authenticated;
grant select on table public.ticker_messages to anon, authenticated;

drop policy if exists ticker_messages_public_read on public.ticker_messages;
create policy ticker_messages_public_read
on public.ticker_messages
for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

create or replace function private.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body text;
  v_admin_title text;
  v_admin_body text;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;

  case new.status
    when 'pending_payment'::public.order_status then
      v_title := 'تم إنشاء الطلب';
      v_body := 'طلبك ' || new.order_number || ' جاهز لإكمال الدفع ورفع الإيصال.';
      v_admin_title := 'طلب جديد';
      v_admin_body := 'تم إنشاء الطلب ' || new.order_number || ' وهو بانتظار الدفع.';
    when 'payment_review'::public.order_status then
      v_title := 'الإيصال تحت المراجعة';
      v_body := 'استلمنا إثبات الدفع للطلب ' || new.order_number || ' وبدأت المراجعة.';
      v_admin_title := 'دفعة تحتاج مراجعة';
      v_admin_body := 'الطلب ' || new.order_number || ' لديه إثبات دفع جديد يحتاج قرار الإدارة.';
    when 'paid'::public.order_status then
      v_title := 'تم تأكيد الدفع';
      v_body := 'تم تأكيد دفع الطلب ' || new.order_number || ' وسيبدأ التنفيذ.';
    when 'processing'::public.order_status then
      v_title := 'الطلب قيد التنفيذ';
      v_body := 'بدأ تنفيذ الطلب ' || new.order_number || '.';
    when 'completed'::public.order_status then
      v_title := 'اكتمل الطلب';
      v_body := 'تم إكمال الطلب ' || new.order_number || ' بنجاح.';
    when 'rejected'::public.order_status then
      v_title := 'تعذر قبول الدفع';
      if nullif(trim(coalesce(new.admin_note, '')), '') is not null then
        v_body := 'تم رفض إثبات الدفع للطلب ' || new.order_number || '. السبب: ' || left(trim(new.admin_note), 350);
      else
        v_body := 'تم رفض إثبات الدفع للطلب ' || new.order_number || '. راجع تفاصيل الطلب ويمكنك رفع إيصال جديد إذا كان متاحًا.';
      end if;
    when 'cancelled'::public.order_status then
      v_title := 'تم إلغاء الطلب';
      v_body := 'تم إلغاء الطلب ' || new.order_number || '.';
    when 'refunded'::public.order_status then
      v_title := 'تم تحديث الاسترداد';
      v_body := 'تم تحويل الطلب ' || new.order_number || ' إلى حالة مسترد.';
    else
      return new;
  end case;

  insert into public.notifications (user_id, title, body, type)
  values (new.user_id, v_title, v_body, 'order_status');

  if v_admin_title is not null then
    insert into public.notifications (user_id, title, body, type)
    select p.id, v_admin_title, v_admin_body, 'admin_order'
    from public.profiles p
    where p.role = 'admin'::public.user_role
      and p.is_active = true
      and p.id <> new.user_id;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_order_status_change() from public, anon, authenticated;
