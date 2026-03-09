import { EditSubscriptionPage } from "@/features/tenant-subscriptions/pages/EditSubscriptionPage"

export default function EditSubscriptionRoute({
  params,
}: {
  params: { subscriptionId: string }
}) {
  const { subscriptionId } = params
  return <EditSubscriptionPage subscriptionId={subscriptionId} />
}
