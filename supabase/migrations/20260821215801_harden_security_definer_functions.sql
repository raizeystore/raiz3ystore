revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.is_admin() from anon, authenticated, public;
grant execute on function public.is_admin() to authenticated;
