import { SubscriptionDetailPage } from "@/features/tenant-subscriptions/pages/SubscriptionDetailPage"

export default function SubscriptionDetailsRoute({
  params,
}: {
  params: { subscriptionId: string }
}) {
  const { subscriptionId } = params
  return <SubscriptionDetailPage subscriptionId={subscriptionId} />
}
