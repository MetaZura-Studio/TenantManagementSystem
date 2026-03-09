import { EditRolePage } from "@/features/roles/pages/EditRolePage"

export default function EditRoleRoute({
  params,
}: {
  params: { roleId: string }
}) {
  const { roleId } = params
  return <EditRolePage roleId={roleId} />
}
