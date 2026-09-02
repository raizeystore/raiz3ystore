import { notFound, redirect } from "next/navigation";
import { getSubcategoryBySlug } from "@/src/lib/catalog/storefront";

export const revalidate = 60;

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getSubcategoryBySlug(slug);
  if (!catalog) notFound();

  const canonicalProduct = catalog.products[0];
  if (!canonicalProduct) notFound();

  redirect(`/products/${canonicalProduct.slug}`);
}
