import { use } from "react"
import { EditTenantPage } from "@/features/tenants/pages/EditTenantPage"

export default function EditTenantRoute({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  return <EditTenantPage tenantId={tenantId} />
}
