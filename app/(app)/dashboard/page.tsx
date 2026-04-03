import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/cards"
import { Building2, CreditCard, DollarSign, FileText } from "lucide-react"
import { prisma } from "@/lib/server/prisma"
import { ChatRequestCard, DemographicCard, KpiNavCard } from "./_widgets"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function monthRangeUtc(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  return { start, end }
}

function countryToLonLat(country: string): { lon: number; lat: number } | null {
  const c = (country || "").trim().toLowerCase()
  // Minimal centroid map for common countries. Extend as your tenant base grows.
  const m: Record<string, { lon: number; lat: number }> = {
    pakistan: { lon: 69.3451, lat: 30.3753 },
    "united arab emirates": { lon: 54.3773, lat: 24.4539 },
    uae: { lon: 54.3773, lat: 24.4539 },
    kuwait: { lon: 47.4818, lat: 29.3117 },
    "saudi arabia": { lon: 45.0792, lat: 23.8859 },
    india: { lon: 78.9629, lat: 20.5937 },
    "united states": { lon: -98.5795, lat: 39.8283 },
    usa: { lon: -98.5795, lat: 39.8283 },
    canada: { lon: -106.3468, lat: 56.1304 },
    "united kingdom": { lon: -3.436, lat: 55.3781 },
    uk: { lon: -3.436, lat: 55.3781 },
    germany: { lon: 10.4515, lat: 51.1657 },
    france: { lon: 2.2137, lat: 46.2276 },
    china: { lon: 104.1954, lat: 35.8617 },
    indonesia: { lon: 113.9213, lat: -0.7893 },
    brazil: { lon: -51.9253, lat: -14.235 },
    nigeria: { lon: 8.6753, lat: 9.082 },
    kenya: { lon: 37.9062, lat: -0.0236 },
  }
  return m[c] || null
}

function projectLonLatToMapXY(lon: number, lat: number) {
  // Equirectangular projection to our SVG viewBox (640x320)
  const x = ((lon + 180) / 360) * 640
  const y = ((90 - lat) / 180) * 320
  return { x, y }
}

export default async function DashboardPage() {
  const { start, end } = monthRangeUtc()

  const [
    totalTenants,
    activeSubscriptions,
    totalUsers,
    pendingInvoices,
    revenueAgg,
    tenantsByCountry,
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
    prisma.tenants.groupBy({
      by: ["country"],
      where: { deleted_at: null, country: { not: null } },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 4,
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
  const demographicRows = (tenantsByCountry as any[]).map((r) => ({
    label: String(r.country || "Unknown"),
    value: Number(r._count?.country ?? 0),
  }))

  const pinPalette = ["#2563eb", "#10b981", "#f97316", "#a855f7"] as const
  const demographicPins = demographicRows
    .map((r, i) => {
      const ll = countryToLonLat(r.label)
      if (!ll) return null
      const { x, y } = projectLonLatToMapXY(ll.lon, ll.lat)
      return { label: r.label, x, y, color: pinPalette[i % pinPalette.length] }
    })
    .filter(Boolean) as Array<{ label: string; x: number; y: number; color: string }>

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 grid gap-6">
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
              { label: "Invoices (due)", value: String(invoicesDueCount), href: "/invoices", hint: `Amount due: ${dueAmount.toFixed(2)}` },
              { label: "Payments (success rate)", value: `${paymentsSuccessRate.toFixed(1)}%`, href: "/payments", hint: `Success: ${paymentsSuccess30d}/${paymentsTotal30d}` },
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
        </div>
        <div className="lg:col-span-5">
          <DemographicCard rows={demographicRows} pins={demographicPins} />
        </div>
        <div className="lg:col-span-5">
          <ChatRequestCard title="Recent Activity" items={[...auditItems, ...activityItems].slice(0, 6)} />
        </div>
      </div>
    </>
  )
}
