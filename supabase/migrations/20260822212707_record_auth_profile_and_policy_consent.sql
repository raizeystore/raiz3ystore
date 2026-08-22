alter table public.profiles
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists privacy_version text,
  add column if not exists terms_version text;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    phone,
    privacy_accepted_at,
    terms_accepted_at,
    privacy_version,
    terms_version
  ) values (
    new.id,
    nullif(coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ), ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'privacy_accepted' = 'true' then now() else null end,
    case when new.raw_user_meta_data ->> 'terms_accepted' = 'true' then now() else null end,
    nullif(new.raw_user_meta_data ->> 'privacy_version', ''),
    nullif(new.raw_user_meta_data ->> 'terms_version', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

grant select (privacy_accepted_at, terms_accepted_at, privacy_version, terms_version)
on public.profiles to authenticated;
