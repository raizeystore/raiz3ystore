-- Legacy game reads are public only when active. Admin reads use the service role.
-- Removing private.is_admin() prevents unrelated catalog queries from failing for anon.

drop policy if exists games_public_read_active on public.games;

create policy games_public_read_active
on public.games
for select
to anon, authenticated
using (status = 'active'::public.product_status);

notify pgrst, 'reload schema';
