import { use } from "react"
import { EditBranchPage } from "@/features/branches/pages/EditBranchPage"

export default function EditBranchRoute({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = use(params)
  return <EditBranchPage branchId={branchId} />
}
