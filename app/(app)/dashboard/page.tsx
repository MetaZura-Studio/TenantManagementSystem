import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/cards"
import { Building2, CreditCard, DollarSign, FileText } from "lucide-react"
import { prisma } from "@/lib/server/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function monthRangeUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  return { start, end }
}

export default async function DashboardPage() {
  const { start, end } = monthRangeUtc()

  const [
    totalTenants,
    activeSubscriptions,
    pendingInvoices,
    revenueAgg,
  ] = await Promise.all([
    prisma.tenants.count({ where: { deleted_at: null } }),
    prisma.tenant_subscriptions.count({
      where: {
        status: {
          in: ["ACTIVE", "Active", "TRIAL", "TRIALING", "PAST_DUE", "Pending"],
        },
      },
    }),
    prisma.invoices.count({
      where: {
        amount_due: { gt: 0 },
        status: { notIn: ["PAID", "CANCELLED"] },
      },
    }),
    prisma.payments.aggregate({
      _sum: { amount: true },
      where: {
        status: { in: ["SUCCESS"] },
        OR: [
          { paid_at: { gte: start, lt: end } },
          { transaction_date: { gte: start, lt: end } },
        ],
      },
    }),
  ])

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)

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
          value={String(totalTenants)}
          description="All registered tenants"
          icon={Building2}
        />
        <StatCard
          title="Active Subscriptions"
          value={String(activeSubscriptions)}
          description="Currently active plans"
          icon={CreditCard}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="Total revenue this month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Invoices"
          value={String(pendingInvoices)}
          description="Invoices awaiting payment"
          icon={FileText}
        />
      </div>
    </>
  )
}
