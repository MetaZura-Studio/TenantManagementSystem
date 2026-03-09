import { EditBranchPage } from "@/features/branches/pages/EditBranchPage"

export default function EditBranchRoute({
  params,
}: {
  params: { branchId: string }
}) {
  const { branchId } = params
  return <EditBranchPage branchId={branchId} />
}
