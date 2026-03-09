"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDialog } from "@/components/shared/feedback"
import { toast } from "@/components/shared/feedback/use-toast"
import { useTenant } from "../hooks"
import { useBranches, useDeleteBranch } from "@/features/branches/hooks"
import { useSubscriptions } from "@/features/tenant-subscriptions/hooks"
import { usePlans } from "@/features/plans/hooks"
import type { Branch } from "@/features/branches/types"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"
import { DataTable } from "@/components/shared/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, ArrowLeft, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

interface TenantDetailPageProps {
  tenantId: string
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const router = useRouter()
  const { data: tenant, isLoading } = useTenant(tenantId)
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches()
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } = useSubscriptions()
  const { data: plans = [] } = usePlans()
  const deleteBranchMutation = useDeleteBranch()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!tenant) {
    return <div className="text-center py-8">Tenant not found</div>
  }

  const tenantBranches = branches.filter((b) => b.tenantId === tenant.id)
  const tenantSubscriptions = subscriptions.filter((s) => s.tenantId === tenant.id)

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
      accessorKey: "branchName",
      header: "Branch Name",
    },
    {
      id: "address",
      header: "Address",
      cell: ({ row }) => {
        const b = row.original
        const parts = [
          b.addressLine1,
          b.addressLine2,
          b.city,
          b.stateProvince,
          b.zipPostalCode,
        ].filter(Boolean)
        return parts.join(", ")
      },
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      cell: ({ row }) => row.original.contactPerson ?? "-",
    },
    {
      accessorKey: "phoneNumber",
      header: "Contact Number",
    },
    {
      accessorKey: "branchStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.branchStatus} />,
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
      cell: ({ row }) => plans.find((p) => p.id === row.original.planId)?.planName ?? row.original.planId,
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
      accessorKey: "changeReason",
      header: "Change Reason",
      cell: ({ row }) => row.original.changeReason ?? "-",
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

  return (
    <>
      <PageHeader
        title="Tenant Details"
        subtitle={tenant.tenantName}
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
          <GlassCardTitle>Tenant Summary</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tenant Name</p>
                <p className="text-lg font-medium">{tenant.tenantName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenant ID</p>
                <p className="text-lg font-medium">{tenant.tenantId}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={tenant.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <p className="text-lg font-medium">{tenant.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-lg font-medium">{tenant.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Branches</h3>
              {isBranchesLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={branchColumns} data={tenantBranches} />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Plans</h3>
              {isSubscriptionsLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={subscriptionColumns} data={tenantSubscriptions} />
              )}
            </div>
          </div>
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
