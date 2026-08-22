"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_RE = /^RZ-[A-Z0-9-]{8,40}$/;
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function uploadReceipt(formData: FormData) {
  const paymentId = String(formData.get("paymentId") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim().toUpperCase();
  const file = formData.get("receipt");
  const orderPath = ORDER_RE.test(orderNumber) ? `/orders/${orderNumber}` : "/orders";

  if (!UUID_RE.test(paymentId) || !(file instanceof File)) {
    redirect(`${orderPath}?error=invalid_receipt`);
  }

  if (!MIME_TO_EXTENSION[file.type] || file.size <= 0 || file.size > MAX_RECEIPT_BYTES) {
    redirect(`${orderPath}?error=invalid_receipt`);
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login?message=login_required");

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment || !["pending", "rejected"].includes(payment.status)) {
    redirect(`${orderPath}?error=payment_not_eligible`);
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, user_id")
    .eq("id", payment.order_id)
    .eq("user_id", userId)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) redirect("/orders?error=order_not_found");

  const extension = MIME_TO_EXTENSION[file.type];
  const storagePath = `${userId}/${paymentId}/${crypto.randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("payment-receipts")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    redirect(`${orderPath}?error=receipt_upload_failed`);
  }

  const { data: receiptResult, error: receiptError } = await admin.rpc("submit_payment_receipt", {
    p_user_id: userId,
    p_payment_id: paymentId,
    p_storage_path: storagePath,
    p_original_filename: file.name.slice(0, 255),
    p_mime_type: file.type,
    p_file_size_bytes: file.size,
  });

  if (receiptError || !receiptResult?.[0]) {
    await admin.storage.from("payment-receipts").remove([storagePath]);
    redirect(`${orderPath}?error=receipt_submit_failed`);
  }

  revalidatePath(orderPath);
  revalidatePath("/orders");
  revalidatePath("/admin");
  redirect(`${orderPath}?message=receipt_submitted`);
}
