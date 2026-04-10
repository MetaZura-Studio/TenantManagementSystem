"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/feedback"
import { toast } from "@/components/shared/feedback/use-toast"
import { Skeletons } from "@/components/shared/feedback/Skeletons"
import { TableSkeleton } from "@/components/shared/feedback/TableSkeleton"
import { useTenant, useTenantActivity } from "../hooks"
import { useBranches, useDeleteBranch } from "@/features/branches/hooks"
import { useSubscriptions } from "@/features/tenant-subscriptions/hooks"
import { usePlans } from "@/features/plans/hooks"
import { useUsers } from "@/features/users/hooks/use-users"
import { useInvoices } from "@/features/invoices/hooks"
import { usePayments } from "@/features/payments/hooks"
import type { Branch } from "@/features/branches/types"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"
import type { User } from "@/features/users/types"
import type { Invoice } from "@/features/invoices/types"
import type { Payment } from "@/features/payments/types"
import { DataTable } from "@/components/shared/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, ArrowLeft, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDateTimeYmdHm, formatDateYmd } from "@/lib/text/dates"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TenantDetailPageProps {
  tenantId: string
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const router = useRouter()
  const { data: tenant, isLoading } = useTenant(tenantId)
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches()
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } = useSubscriptions()
  const { data: plans = [] } = usePlans()
  const { data: users = [], isLoading: isUsersLoading } = useUsers()
  const { data: invoices = [], isLoading: isInvoicesLoading } = useInvoices()
  const { data: payments = [], isLoading: isPaymentsLoading } = usePayments()
  const { data: activity = [], isLoading: isActivityLoading } = useTenantActivity(tenantId)
  const deleteBranchMutation = useDeleteBranch()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null)

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Tenant Details"
          subtitle="Loading..."
          breadcrumbs={[
            { label: "Tenant Management", href: "/tenants" },
            { label: "Tenants List", href: "/tenants" },
            { label: "Tenant Details" },
          ]}
          actions={
            <>
              <Button variant="outline" size="lg" disabled>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button size="lg" disabled>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Tenant
              </Button>
            </>
          }
        />

        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Tenant Profile</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
              <div className="space-y-4">
                <div>
                  <Skeletons className="h-3 w-24 mb-2" />
                  <Skeletons className="h-6 w-56" />
                </div>
                <div>
                  <Skeletons className="h-3 w-24 mb-2" />
                  <Skeletons className="h-6 w-40" />
                </div>
                <div>
                  <Skeletons className="h-3 w-24 mb-2" />
                  <Skeletons className="h-6 w-28" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Skeletons className="h-3 w-28 mb-2" />
                  <Skeletons className="h-6 w-32" />
                </div>
                <div>
                  <Skeletons className="h-3 w-24 mb-2" />
                  <Skeletons className="h-6 w-56" />
                </div>
                <div>
                  <Skeletons className="h-3 w-24 mb-2" />
                  <Skeletons className="h-6 w-40" />
                </div>
              </div>
            </div>
            <TableSkeleton rows={6} cols={6} className="p-0" />
          </GlassCardContent>
        </GlassCard>
      </>
    )
  }

  if (!tenant) {
    return <div className="text-center py-8">Tenant not found</div>
  }

  // Keep derivations simple to avoid hook-order issues.
  const tenantBranches = branches.filter((b) => b.tenantId === tenant.id)
  const tenantSubscriptions = subscriptions.filter((s) => s.tenantId === tenant.id)
  const tenantUsers = users.filter((u) => u.tenantId === tenant.id)
  const tenantInvoices = invoices.filter((i) => i.tenantId === tenant.id)
  const tenantPayments = payments.filter((p) => p.tenantId === tenant.id)

  const handleDeleteBranch = (id: string) => {
    setBranchToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteBranch = () => {
    if (branchToDelete) {
      deleteBranchMutation.mutate(branchToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Branch deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete branch",
            variant: "destructive",
          })
        },
      })
    }
  }

  const branchColumns: ColumnDef<Branch>[] = [
    {
      accessorKey: "nameEn",
      header: "Branch Name",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const b = row.original
        const parts = [b.address, b.city, b.state, b.zipCode, b.country].filter(Boolean)
        return parts.join(", ")
      },
    },
    {
      accessorKey: "contactName",
      header: "Contact Person",
      cell: ({ row }) => row.original.contactName ?? "-",
    },
    {
      accessorKey: "phone",
      header: "Contact Number",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const b = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/branches/${b.id}/edit`} title="View branch">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/branches/${b.id}/edit`} title="Edit branch">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteBranch(b.id)}
              title="Delete branch"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const subscriptionColumns: ColumnDef<TenantSubscription>[] = [
    {
      id: "planName",
      header: "Plan Name",
      cell: ({ row }) => plans.find((p) => p.id === row.original.planId)?.nameEn ?? row.original.planId,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "currentPeriodEnd",
      header: "End Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => {
        const currency = row.original.billingCurrency === "USD" ? "$" : row.original.billingCurrency
        return `${currency}${row.original.unitPrice.toFixed(2)}/month`
      },
    },
    {
      accessorKey: "overrideNotes",
      header: "Change Reason",
      cell: ({ row }) => row.original.overrideNotes ?? row.original.notes ?? "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/tenant-subscriptions/${s.id}`} title="View subscription">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]

  const userColumns: ColumnDef<User>[] = [
    { accessorKey: "fullNameEn", header: "Name" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    {
      id: "branch",
      header: "Branch",
      cell: ({ row }) => {
        const u = row.original
        if (!u.branchId) return "Main branch"
        return tenantBranches.find((b) => b.id === u.branchId)?.nameEn ?? u.branchId
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ]

  const invoiceColumns: ColumnDef<Invoice>[] = [
    { accessorKey: "invoiceCode", header: "Invoice Code" },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => (row.original.issueDate ? formatDateYmd(row.original.issueDate) : "—"),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (row.original.dueDate ? formatDateYmd(row.original.dueDate) : "—"),
    },
    {
      accessorKey: "status",
      header: "Invoice Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "amountDue",
      header: "Amount Due",
      cell: ({ row }) => {
        const inv = row.original
        const cur = inv.currencyCode || ""
        return `${cur} ${Number(inv.amountDue ?? 0).toFixed(3)}`
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/invoices/${row.original.id}`} title="View invoice">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ]

  const paymentColumns: ColumnDef<Payment>[] = [
    { accessorKey: "paymentCode", header: "Payment ID" },
    { accessorKey: "paymentReference", header: "Reference" },
    {
      accessorKey: "transactionDate",
      header: "Date",
      cell: ({ row }) => (row.original.transactionDate ? formatDateYmd(row.original.transactionDate) : "—"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const p = row.original
        return `${p.currencyCode || ""} ${Number(p.amount ?? 0).toFixed(3)}`
      },
    },
    {
      id: "invoice",
      header: "Invoice",
      cell: ({ row }) => {
        const invId = row.original.invoiceId
        return invId ? (
          <Link className="underline underline-offset-2" href={`/invoices/${invId}`}>
            {invId}
          </Link>
        ) : (
          "—"
        )
      },
    },
  ]

  const activityColumns: ColumnDef<(typeof activity)[number]>[] = [
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTimeYmdHm(row.original.createdAt) },
    { accessorKey: "actorType", header: "Actor" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "entityType", header: "Entity" },
    { accessorKey: "entityId", header: "Entity ID" },
  ]

  return (
    <>
      <PageHeader
        title="Tenant Details"
        subtitle={tenant.shopNameEn}
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Tenants List", href: "/tenants" },
          { label: "Tenant Details" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Link href={`/tenants/${tenantId}/edit`}>
              <Button size="lg">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Tenant
              </Button>
            </Link>
          </>
        }
      />

      <GlassCard variant="default">
        <GlassCardHeader>
          <GlassCardTitle>Tenant Profile</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-max min-w-full justify-start bg-transparent p-0 h-auto gap-2">
                {[
                  { v: "overview", label: "Overview", tone: "from-sky-500/15 to-indigo-500/15" },
                  { v: "subscriptions", label: "Subscriptions", tone: "from-violet-500/15 to-fuchsia-500/15" },
                  { v: "branches", label: "Branches", tone: "from-emerald-500/15 to-teal-500/15" },
                  { v: "users", label: "Users", tone: "from-amber-500/15 to-orange-500/15" },
                  { v: "invoices", label: "Invoices", tone: "from-cyan-500/15 to-blue-500/15" },
                  { v: "payments", label: "Payments", tone: "from-rose-500/15 to-pink-500/15" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-[13px] font-medium border border-border/30",
                      "bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl",
                      "hover:bg-white/80 dark:hover:bg-slate-950/55 hover:border-primary/25 transition-colors",
                      "data-[state=active]:text-primary data-[state=active]:border-primary/30 data-[state=active]:shadow-sm",
                      `data-[state=active]:bg-gradient-to-b ${t.tone}`
                    )}
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant Name</p>
                    <p className="text-lg font-medium">{tenant.shopNameEn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant Code</p>
                    <p className="text-lg font-medium">{tenant.tenantCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Prefix</p>
                    <p className="text-lg font-medium">{tenant.invoicePrefix || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Logo</p>
                    {tenant.logoUrl ? (
                      <img
                        src={tenant.logoUrl}
                        alt={`${tenant.shopNameEn} logo`}
                        className="mt-2 h-10 w-10 rounded-md border border-border/50 object-contain bg-white"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">—</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Status</p>
                    <StatusBadge status={tenant.subscriptionStatus} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Email</p>
                    <p className="text-lg font-medium">{tenant.ownerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="text-lg font-medium">{tenant.contactPerson || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-medium">{tenant.ownerMobile}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branches">
              {isBranchesLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={branchColumns} data={tenantBranches} />
              )}
            </TabsContent>

            <TabsContent value="subscriptions">
              {isSubscriptionsLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={subscriptionColumns} data={tenantSubscriptions} />
              )}
            </TabsContent>

            <TabsContent value="users">
              {isUsersLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={userColumns} data={tenantUsers} />
              )}
            </TabsContent>

            <TabsContent value="invoices">
              {isInvoicesLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={invoiceColumns} data={tenantInvoices} />
              )}
            </TabsContent>

            <TabsContent value="payments">
              {isPaymentsLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={paymentColumns} data={tenantPayments} />
              )}
            </TabsContent>
          </Tabs>
        </GlassCardContent>
      </GlassCard>

      <GlassCard variant="subtle" className="mt-6">
        <GlassCardHeader>
          <GlassCardTitle>Activity</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {isActivityLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : (
            <DataTable columns={activityColumns} data={activity as any[]} />
          )}
        </GlassCardContent>
      </GlassCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        onConfirm={confirmDeleteBranch}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
