import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

export const CATALOG_MEDIA_BUCKET = "catalog-media";
export const CATALOG_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class CatalogMediaError extends Error {
  code: "invalid_type" | "too_large" | "upload_failed";

  constructor(code: CatalogMediaError["code"]) {
    super(code);
    this.name = "CatalogMediaError";
    this.code = code;
  }
}

function existingImageUrl(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim().slice(0, 1000) : "";
  if (!raw) return null;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const url = new URL(raw);
    const allowed =
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/catalog-media/");
    return allowed ? url.toString() : null;
  } catch {
    return null;
  }
}

function selectedFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  const extension = MIME_EXTENSIONS[value.type];
  if (!extension) throw new CatalogMediaError("invalid_type");
  if (value.size > CATALOG_MEDIA_MAX_BYTES) {
    throw new CatalogMediaError("too_large");
  }
  return { file: value, extension };
}

export async function resolveCatalogImage(
  admin: SupabaseClient<Database>,
  formData: FormData,
  options: {
    fileKey: string;
    existingKey: string;
    folder: "categories" | "subcategories" | "products" | "banners";
  },
) {
  const selection = selectedFile(formData.get(options.fileKey));
  if (!selection) return existingImageUrl(formData.get(options.existingKey));

  const path = `${options.folder}/${crypto.randomUUID()}.${selection.extension}`;
  const { error } = await admin.storage.from(CATALOG_MEDIA_BUCKET).upload(path, selection.file, {
    cacheControl: "31536000",
    contentType: selection.file.type,
    upsert: false,
  });
  if (error) throw new CatalogMediaError("upload_failed");

  const { data } = admin.storage.from(CATALOG_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
