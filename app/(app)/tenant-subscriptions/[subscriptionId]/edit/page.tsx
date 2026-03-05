import { use } from "react"
import { EditSubscriptionPage } from "@/features/tenant-subscriptions/pages/EditSubscriptionPage"

export default function EditSubscriptionRoute({
  params,
}: {
  params: Promise<{ subscriptionId: string }>
}) {
  const { subscriptionId } = use(params)
  return <EditSubscriptionPage subscriptionId={subscriptionId} />
}
