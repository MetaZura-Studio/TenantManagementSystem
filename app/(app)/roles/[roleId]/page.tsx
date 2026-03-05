import { use } from "react"
import { RoleDetailPage } from "@/features/roles/pages/RoleDetailPage"

export default function RoleDetailsRoute({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = use(params)
  return <RoleDetailPage roleId={roleId} />
}
