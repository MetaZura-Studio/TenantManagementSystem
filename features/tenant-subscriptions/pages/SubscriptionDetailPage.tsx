"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useSubscription } from "../hooks"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDateYmd } from "@/lib/text/dates"

interface SubscriptionDetailPageProps {
  subscriptionId: string
}

export function SubscriptionDetailPage({ subscriptionId }: SubscriptionDetailPageProps) {
  const router = useRouter()
  const { data: subscription, isLoading } = useSubscription(subscriptionId)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!subscription) {
    return <div className="text-center py-8">Subscription not found</div>
  }

  return (
    <>
      <PageHeader
        title="Subscription Details"
        subtitle={`Subscription ${subscription.subscriptionId}`}
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions", href: "/tenant-subscriptions" },
          { label: "Subscription Details" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Link href={`/tenant-subscriptions/${subscriptionId}/edit`}>
              <Button size="lg">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Subscription
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Subscription Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Subscription ID</p>
                <p className="text-lg font-medium">{subscription.subscriptionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={subscription.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-lg font-medium">{formatDateYmd(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Period End</p>
                <p className="text-lg font-medium">{formatDateYmd(subscription.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="text-lg font-medium">
                  {subscription.billingCurrency} {subscription.unitPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto Renew</p>
                <p className="text-lg font-medium">{subscription.autoRenew ? "Yes" : "No"}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </>
  )
}
