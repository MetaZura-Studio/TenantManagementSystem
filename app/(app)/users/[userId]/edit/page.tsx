import { EditUserPage } from "@/features/users/pages/EditUserPage"

export default function EditUserRoute({
  params,
}: {
  params: { userId: string }
}) {
  const { userId } = params
  return <EditUserPage userId={userId} />
}
