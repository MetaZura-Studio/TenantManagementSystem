import { RoleDetailPage } from "@/features/roles/pages/RoleDetailPage"

export default function RoleDetailsRoute({
  params,
}: {
  params: { roleId: string }
}) {
  const { roleId } = params
  return <RoleDetailPage roleId={roleId} />
}
