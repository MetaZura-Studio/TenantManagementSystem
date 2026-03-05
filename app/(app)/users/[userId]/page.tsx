import { use } from "react"
import { UserDetailPage } from "@/features/users/pages/UserDetailPage"

export default function UserDetailsRoute({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  return <UserDetailPage userId={userId} />
}
