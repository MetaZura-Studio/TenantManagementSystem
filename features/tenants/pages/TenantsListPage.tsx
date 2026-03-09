"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/badges"
import { ConfirmDialog } from "@/components/shared/feedback"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useTenants, useDeleteTenant } from "../hooks"
import type { Tenant } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, Plus, GitBranch } from "lucide-react"
import Link from "next/link"

export function TenantsListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    tenantName: "",
    status: "All",
    subscriptionStatus: "All",
  })

  const { data: tenants = [], isLoading } = useTenants()
  const deleteMutation = useDeleteTenant()

  const filteredTenants = tenants.filter((tenant) => {
    if (filters.tenantName && !tenant.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase())) {
      return false
    }
    if (filters.status !== "All" && tenant.status !== filters.status) {
      return false
    }
    if (filters.subscriptionStatus !== "All" && tenant.subscriptionStatus !== filters.subscriptionStatus) {
      return false
    }
    return true
  })

  const handleDelete = (id: string) => {
    setTenantToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (tenantToDelete) {
      deleteMutation.mutate(tenantToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Tenant deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete tenant",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<Tenant>[] = [
    {
      accessorKey: "tenantId",
      header: "Tenant ID",
    },
    {
      accessorKey: "tenantName",
      header: "Tenant Name",
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "subscriptionStatus",
      header: "Subscription Status",
      cell: ({ row }) => <StatusBadge status={row.original.subscriptionStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tenant = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/tenants/${tenant.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/tenants/${tenant.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/branches?tenantId=${encodeURIComponent(tenant.id)}`}>
              <Button variant="ghost" size="icon" title="View branches for this tenant">
                <GitBranch className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(tenant.id)}
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
        title="Tenants List"
        subtitle="Manage all your tenants"
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Tenants List" },
        ]}
        actions={
          <Button onClick={() => router.push("/tenants/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        }
      />

      <GlassCard variant="subtle" className="mb-6">
        <GlassCardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Tenant Name</label>
              <Input
                placeholder="Search by tenant name..."
                value={filters.tenantName}
                onChange={(e) => setFilters({ ...filters, tenantName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Subscription Status</label>
              <Select
                value={filters.subscriptionStatus}
                onValueChange={(value) => setFilters({ ...filters, subscriptionStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={filteredTenants} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tenant"
        description="Are you sure you want to delete this tenant? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
