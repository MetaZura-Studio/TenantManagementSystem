import { use } from "react"
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage"

export default function TenantDetailRoute({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  return <TenantDetailPage tenantId={tenantId} />
}
