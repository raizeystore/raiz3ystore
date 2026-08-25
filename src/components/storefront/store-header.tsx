import { StoreHeaderClient } from "@/src/components/storefront/store-header-client";
import { getStoreHeaderContext } from "@/src/lib/storefront/shell";

export async function StoreHeader() {
  const context = await getStoreHeaderContext();
  return <StoreHeaderClient context={context} />;
}
