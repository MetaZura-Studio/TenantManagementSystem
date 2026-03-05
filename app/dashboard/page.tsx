import { AppShell } from "@/components/app-shell"
import { PageHeaderV2 } from "@/components/page-header-v2"
import { ModernStatCard } from "@/components/modern-stat-card"
import { Building2, CreditCard, DollarSign, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeaderV2
        title="Dashboard"
        subtitle="Overview of your tenant management system"
        breadcrumbs={[{ label: "Dashboard" }]}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatCard
          title="Total Tenants"
          value="0"
          description="All registered tenants"
          icon={Building2}
        />
        <ModernStatCard
          title="Active Subscriptions"
          value="0"
          description="Currently active plans"
          icon={CreditCard}
        />
        <ModernStatCard
          title="Total Revenue"
          value="$0"
          description="Total revenue this month"
          icon={DollarSign}
        />
        <ModernStatCard
          title="Pending Invoices"
          value="0"
          description="Invoices awaiting payment"
          icon={FileText}
        />
      </div>
    </AppShell>
  )
}
