import { use } from "react"
import { SubscriptionDetailPage } from "@/features/tenant-subscriptions/pages/SubscriptionDetailPage"

export default function SubscriptionDetailsRoute({
  params,
}: {
  params: Promise<{ subscriptionId: string }>
}) {
  const { subscriptionId } = use(params)
  return <SubscriptionDetailPage subscriptionId={subscriptionId} />
}
