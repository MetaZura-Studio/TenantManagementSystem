import { EditPlanPage } from "@/features/plans/pages/EditPlanPage"

export default function EditPlanRoute({
  params,
}: {
  params: { planId: string }
}) {
  const { planId } = params
  return <EditPlanPage planId={planId} />
}
