import { EditTenantPage } from "@/features/tenants/pages/EditTenantPage"

export default function EditTenantRoute({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  return <EditTenantPage tenantId={tenantId} />
}
