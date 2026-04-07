import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/cards"
import { Building2, CreditCard, DollarSign, FileText } from "lucide-react"
import { prisma } from "@/lib/server/prisma"
import { ChatRequestCard, KpiNavCard, TopPlansCard } from "./_widgets"

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
    totalUsers,
    pendingInvoices,
    revenueAgg,
    paymentsSuccess30d,
    paymentsTotal30d,
    invoicesDueCount,
    invoicesDueAmountAgg,
    plansByActiveSubs,
    recentUsers,
    recentAudits,
  ] = await Promise.all([
    prisma.tenants.count({ where: { deleted_at: null } }),
    prisma.tenant_subscriptions.count({
      where: {
        status: {
          in: ["ACTIVE", "Active", "TRIAL", "TRIALING", "PAST_DUE", "Pending"],
        },
      },
    }),
    prisma.users.count({}),
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
    prisma.payments.count({
      where: {
        status: "SUCCESS",
        OR: [
          { paid_at: { gte: start, lt: end } },
          { transaction_date: { gte: start, lt: end } },
        ],
      },
    }),
    prisma.payments.count({
      where: {
        OR: [
          { paid_at: { gte: start, lt: end } },
          { transaction_date: { gte: start, lt: end } },
        ],
      },
    }),
    prisma.invoices.count({
      where: {
        amount_due: { gt: 0 },
        status: { notIn: ["PAID", "CANCELLED"] },
      },
    }),
    prisma.invoices.aggregate({
      _sum: { amount_due: true },
      where: { amount_due: { gt: 0 }, status: { notIn: ["PAID", "CANCELLED"] } },
    }),
    prisma.tenant_subscriptions.groupBy({
      by: ["plan_id"],
      where: {
        status: {
          in: ["ACTIVE", "Active", "TRIAL", "TRIALING", "PAST_DUE", "Pending"],
        },
      },
      _count: { plan_id: true },
      orderBy: { _count: { plan_id: "desc" } },
      take: 5,
    }),
    prisma.users.findMany({
      take: 4,
      orderBy: [{ last_login_at: "desc" }, { created_at: "desc" }],
      select: {
        full_name_en: true,
        email: true,
        last_login_at: true,
        created_at: true,
      },
    }),
    prisma.audit_logs.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      select: {
        actor_type: true,
        action: true,
        entity_type: true,
        entity_id: true,
        created_at: true,
      },
    }),
  ])

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)

  const paymentsSuccessRate =
    paymentsTotal30d > 0 ? (paymentsSuccess30d / paymentsTotal30d) * 100 : 0
  const dueAmount = Number(invoicesDueAmountAgg._sum.amount_due ?? 0)

  const planIds = (plansByActiveSubs as any[]).map((p) => Number(p.plan_id)).filter((n) => Number.isFinite(n))
  const planRows =
    planIds.length > 0
      ? await prisma.plans.findMany({
          where: { id: { in: planIds } },
          select: { id: true, name_en: true },
        })
      : []
  const planNameById = new Map<number, string>()
  for (const p of planRows as any[]) planNameById.set(Number(p.id), String(p.name_en))
  const topPlans = (plansByActiveSubs as any[]).map((p) => ({
    name: planNameById.get(Number(p.plan_id)) || `Plan #${p.plan_id}`,
    count: Number(p._count?.plan_id ?? 0),
  }))

  const activityItems = (recentUsers as any[]).map((u) => {
    const name = String(u.full_name_en || u.email || "User")
    const when = u.last_login_at || u.created_at
    const time = when ? new Date(when).toISOString().slice(0, 10) : ""
    return {
      name,
      msg: u.last_login_at ? `Last login: ${u.email}` : `New user: ${u.email}`,
      time,
    }
  })

  const auditItems = (recentAudits as any[]).map((a) => {
    const time = a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : ""
    const name = String(a.actor_type || "system")
    const msg = `${a.action} • ${a.entity_type}#${a.entity_id}`
    return { name, msg, time }
  })

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your tenant management system"
        breadcrumbs={[{ label: "Dashboard" }]}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <StatCard
          title="Total Tenants"
          value={String(totalTenants)}
          description="All registered tenants"
          icon={Building2}
          tone="orange"
        />
        <StatCard
          title="Active Subscriptions"
          value={String(activeSubscriptions)}
          description="Currently active plans"
          icon={CreditCard}
          tone="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="Total revenue this month"
          icon={DollarSign}
          tone="cyan"
        />
        <StatCard
          title="Pending Invoices"
          value={String(pendingInvoices)}
          description="Invoices awaiting payment"
          icon={FileText}
          tone="green"
        />
      </div>

      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <KpiNavCard
          title="Tenants & Users"
          subtitle="Quick navigation"
          items={[
            { label: "Tenants", value: String(totalTenants), href: "/tenants" },
            { label: "Users", value: String(totalUsers), href: "/users" },
            { label: "Branches", value: "View", href: "/branches", hint: "Manage tenant branches" },
          ]}
        />
        <KpiNavCard
          title="Invoices & Payments"
          subtitle="Last 30 days and outstanding"
          items={[
            {
              label: "Invoices (due)",
              value: String(invoicesDueCount),
              href: "/invoices",
              hint: `Amount due: ${dueAmount.toFixed(2)}`,
            },
            {
              label: "Payments (success rate)",
              value: `${paymentsSuccessRate.toFixed(1)}%`,
              href: "/payments",
              hint: `Success: ${paymentsSuccess30d}/${paymentsTotal30d}`,
            },
            { label: "Revenue (this month)", value: `$${totalRevenue.toFixed(2)}`, href: "/payments" },
          ]}
        />
        <KpiNavCard
          title="Plans & Subscriptions"
          subtitle="Active subscriptions by plan"
          items={[
            { label: "Plans", value: "View", href: "/plans" },
            { label: "Subscriptions", value: String(activeSubscriptions), href: "/tenant-subscriptions" },
            ...(topPlans.slice(0, 3).map((p) => ({
              label: p.name,
              value: String(p.count),
              href: "/tenant-subscriptions",
              hint: "Active subscriptions",
            })) as any),
          ]}
        />
        <TopPlansCard rows={topPlans} total={activeSubscriptions} />
        <div className="lg:col-span-2">
          <ChatRequestCard title="Recent Activity" items={[...auditItems, ...activityItems].slice(0, 6)} />
        </div>
      </div>
    </>
  )
}
