import { use } from "react"
import { EditUserPage } from "@/features/users/pages/EditUserPage"

export default function EditUserRoute({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  return <EditUserPage userId={userId} />
}
