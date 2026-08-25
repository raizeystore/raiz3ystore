-- Legacy game reads are public only when active. Admin reads use the service role.
-- The public policy must not depend on private helper execution for anonymous reads.

drop policy if exists games_public_read_active on public.games;

create policy games_public_read_active
on public.games
for select
to anon, authenticated
using (status = 'active'::public.product_status);

notify pgrst, 'reload schema';
