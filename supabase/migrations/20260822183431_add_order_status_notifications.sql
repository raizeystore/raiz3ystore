create or replace function private.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_body text;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;

  case new.status
    when 'pending_payment'::public.order_status then
      v_title := 'تم إنشاء الطلب';
      v_body := 'طلبك ' || new.order_number || ' جاهز لإكمال الدفع ورفع الإيصال.';
    when 'payment_review'::public.order_status then
      v_title := 'الإيصال تحت المراجعة';
      v_body := 'استلمنا إثبات الدفع للطلب ' || new.order_number || ' وبدأت المراجعة.';
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
      v_body := 'تم رفض إثبات الدفع للطلب ' || new.order_number || '. راجع تفاصيل الطلب ويمكنك رفع إيصال جديد إذا كان متاحًا.';
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

  return new;
end;
$$;

revoke all on function private.notify_order_status_change() from public, anon, authenticated;

drop trigger if exists orders_create_status_notification on public.orders;
create trigger orders_create_status_notification
after insert or update of status
on public.orders
for each row execute function private.notify_order_status_change();
