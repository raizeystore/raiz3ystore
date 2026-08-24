import { redirect } from "next/navigation";

export default function LegacyCatalogCreateRedirect() {
  redirect("/admin/catalog/products");
}
