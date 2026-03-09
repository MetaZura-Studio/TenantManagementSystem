import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage"

export default function TenantDetailRoute({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  return <TenantDetailPage tenantId={tenantId} />
}
