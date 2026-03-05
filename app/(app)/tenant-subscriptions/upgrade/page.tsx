import { PageHeader } from "@/components/shared/page-header"

export default function UpgradeSubscriptionPage() {
  return (
    <>
      <PageHeader
        title="Subscription Upgrade"
        subtitle="Upgrade tenant subscription plan"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions", href: "/tenant-subscriptions" },
          { label: "Subscription Upgrade" },
        ]}
      />
      <p className="text-muted-foreground">Upgrade wizard will be displayed here</p>
    </>
  )
}
