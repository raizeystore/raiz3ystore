-- Direct client admin writes are intentionally disabled; trusted server actions will handle them.
drop policy if exists games_admin_write on public.games;
drop policy if exists products_admin_write on public.products;
drop policy if exists payment_methods_admin_write on public.payment_methods;
drop policy if exists notifications_admin_write on public.notifications;

create index if not exists order_items_product_id_idx
  on public.order_items(product_id);
create index if not exists payments_payment_method_id_idx
  on public.payments(payment_method_id);
create index if not exists payments_reviewed_by_idx
  on public.payments(reviewed_by);
create index if not exists store_settings_updated_by_idx
  on public.store_settings(updated_by);
