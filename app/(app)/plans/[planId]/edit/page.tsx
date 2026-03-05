import { use } from "react"
import { EditPlanPage } from "@/features/plans/pages/EditPlanPage"

export default function EditPlanRoute({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = use(params)
  return <EditPlanPage planId={planId} />
}
