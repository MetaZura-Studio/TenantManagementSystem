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
import { useUsers } from "@/features/users/hooks/use-users"
import type { Branch } from "@/features/branches/types"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"
import type { User } from "@/features/users/types"
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
  const { data: users = [], isLoading: isUsersLoading } = useUsers()
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
  const tenantUsers = users.filter((u) => u.tenantId === tenant.id)

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
          <GlassCardTitle>Tenant Summary</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tenant Name</p>
                <p className="text-lg font-medium">{tenant.shopNameEn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenant ID</p>
                <p className="text-lg font-medium">{tenant.tenantCode}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={tenant.subscriptionStatus} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Users</h3>
                <div className="text-sm text-muted-foreground">
                  Total Users: <span className="font-medium text-foreground">{tenantUsers.length}</span>
                </div>
              </div>
              {isUsersLoading ? (
                <div className="p-12 text-center text-muted-foreground">Loading...</div>
              ) : (
                <DataTable columns={userColumns} data={tenantUsers} />
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
