create or replace function private.sync_auth_profile_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles p
  set
    display_name = coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      p.display_name
    ),
    phone = coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), p.phone),
    privacy_accepted_at = case
      when new.raw_user_meta_data ->> 'privacy_accepted' = 'true'
        then coalesce(p.privacy_accepted_at, now())
      else p.privacy_accepted_at
    end,
    terms_accepted_at = case
      when new.raw_user_meta_data ->> 'terms_accepted' = 'true'
        then coalesce(p.terms_accepted_at, now())
      else p.terms_accepted_at
    end,
    privacy_version = coalesce(nullif(new.raw_user_meta_data ->> 'privacy_version', ''), p.privacy_version),
    terms_version = coalesce(nullif(new.raw_user_meta_data ->> 'terms_version', ''), p.terms_version),
    updated_at = now()
  where p.id = new.id;

  return new;
end;
$$;

revoke all on function private.sync_auth_profile_metadata() from public, anon, authenticated;

drop trigger if exists on_auth_user_metadata_updated on auth.users;
create trigger on_auth_user_metadata_updated
after update of raw_user_meta_data on auth.users
for each row execute function private.sync_auth_profile_metadata();
