import { use } from "react"
import { EditRolePage } from "@/features/roles/pages/EditRolePage"

export default function EditRoleRoute({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = use(params)
  return <EditRolePage roleId={roleId} />
}
