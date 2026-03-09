import { UserDetailPage } from "@/features/users/pages/UserDetailPage"

export default function UserDetailsRoute({
  params,
}: {
  params: { userId: string }
}) {
  const { userId } = params
  return <UserDetailPage userId={userId} />
}
