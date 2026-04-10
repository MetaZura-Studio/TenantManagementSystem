"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/feedback"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useSubscriptions, useDeleteSubscription } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { usePlans } from "@/features/plans/hooks"
import type { TenantSubscription } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Eye, ArrowUpCircle } from "lucide-react"
import Link from "next/link"

function formatDateOnly(value: unknown): string {
  const s = String(value ?? "").trim()
  if (!s) return "—"
  // Handles ISO strings like 2026-03-31T00:00:00.000Z
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const ts = Date.parse(s)
  if (!Number.isNaN(ts)) return new Date(ts).toISOString().slice(0, 10)
  return s
}

export function SubscriptionsListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null)

  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const { data: tenants = [] } = useTenants()
  const { data: plans = [] } = usePlans()
  const deleteMutation = useDeleteSubscription()

  const handleDelete = (id: string) => {
    setSubscriptionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (subscriptionToDelete) {
      deleteMutation.mutate(subscriptionToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Subscription deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete subscription",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<TenantSubscription>[] = [
    {
      accessorKey: "subscriptionId",
      header: "Subscription ID",
    },
    {
      id: "tenant",
      header: "Tenant",
      accessorFn: (row) => {
        const tenant = tenants.find((t) => t.id === row.tenantId)
        return tenant?.shopNameEn || tenant?.tenantCode || row.tenantId
      },
      cell: ({ row }) => {
        const sub = row.original
        const tenant = tenants.find((t) => t.id === sub.tenantId)
        const label = tenant?.shopNameEn || tenant?.tenantCode || sub.tenantId
        return (
          <Link className="text-primary hover:underline" href={`/tenants/${sub.tenantId}`}>
            {label}
          </Link>
        )
      },
    },
    {
      id: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const sub = row.original
        const plan = plans.find((p) => p.id === sub.planId)
        return plan?.nameEn || plan?.planCode || sub.planId
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDateOnly(row.original.startDate),
    },
    {
      accessorKey: "currentPeriodEnd",
      header: "Period End",
      cell: ({ row }) => formatDateOnly(row.original.currentPeriodEnd ?? row.original.endDate),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subscription = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/tenant-subscriptions/${subscription.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href={`/tenant-subscriptions/upgrade?subscriptionId=${encodeURIComponent(subscription.id)}`}
              title="Upgrade plan"
            >
              <Button variant="ghost" size="icon">
                <ArrowUpCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/tenant-subscriptions/${subscription.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(subscription.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Tenant Subscriptions"
        subtitle="Manage tenant subscriptions"
        breadcrumbs={[
          { label: "Plans & Subscriptions", href: "/plans" },
          { label: "Tenant Subscriptions" },
        ]}
        actions={
          <Button onClick={() => router.push("/tenant-subscriptions/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        }
      />

      <GlassCard variant="default">
        <GlassCardContent className="p-0">
          <DataTable
            loading={isLoading}
            loadingRows={8}
            loadingCols={7}
            columns={columns}
            data={subscriptions}
            search={{ columnId: "subscriptionId", placeholder: "Search subscriptions..." }}
            sort={{
              options: [
                { label: "Tenant", columnId: "tenant" },
                { label: "Start Date", columnId: "startDate" },
                { label: "Period End", columnId: "currentPeriodEnd" },
                { label: "Status", columnId: "status" },
                { label: "Subscription ID", columnId: "subscriptionId" },
              ],
              defaultColumnId: "startDate",
              defaultDirection: "desc",
            }}
          />
        </GlassCardContent>
      </GlassCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subscription"
        description="Are you sure you want to delete this subscription? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
