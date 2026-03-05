import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/cards"
import { Building2, CreditCard, DollarSign, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your tenant management system"
        breadcrumbs={[{ label: "Dashboard" }]}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value="0"
          description="All registered tenants"
          icon={Building2}
        />
        <StatCard
          title="Active Subscriptions"
          value="0"
          description="Currently active plans"
          icon={CreditCard}
        />
        <StatCard
          title="Total Revenue"
          value="$0"
          description="Total revenue this month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Invoices"
          value="0"
          description="Invoices awaiting payment"
          icon={FileText}
        />
      </div>
    </>
  )
}
