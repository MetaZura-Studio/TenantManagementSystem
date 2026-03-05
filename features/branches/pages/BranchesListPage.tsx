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
import { useBranches, useDeleteBranch } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import type { Branch } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus } from "lucide-react"
import Link from "next/link"

export function BranchesListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    branchName: "",
    tenantId: "All",
    status: "All",
  })

  const { data: branches = [], isLoading } = useBranches()
  const { data: tenants = [] } = useTenants()
  const deleteMutation = useDeleteBranch()

  const filteredBranches = branches.filter((branch) => {
    if (filters.branchName && !branch.branchName.toLowerCase().includes(filters.branchName.toLowerCase())) {
      return false
    }
    if (filters.tenantId !== "All" && branch.tenantId !== filters.tenantId) {
      return false
    }
    if (filters.status !== "All" && branch.branchStatus !== filters.status) {
      return false
    }
    return true
  })

  const handleDelete = (id: string) => {
    setBranchToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (branchToDelete) {
      deleteMutation.mutate(branchToDelete, {
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

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "branchName",
      header: "Branch Name",
    },
    {
      accessorKey: "tenantId",
      header: "Tenant",
      cell: ({ row }) => {
        const tenant = tenants.find((t) => t.id === row.original.tenantId)
        return tenant?.tenantName || row.original.tenantId
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "city",
      header: "City",
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
        const branch = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/branches/${branch.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(branch.id)}
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
        title="Branches"
        subtitle="Manage all branches"
        breadcrumbs={[
          { label: "Tenant Management", href: "/tenants" },
          { label: "Branches" },
        ]}
        actions={
          <Button onClick={() => router.push("/branches/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        }
      />

      <GlassCard variant="subtle" className="mb-6">
        <GlassCardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Branch Name</label>
              <Input
                placeholder="Search by branch name..."
                value={filters.branchName}
                onChange={(e) => setFilters({ ...filters, branchName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tenant</label>
              <Select
                value={filters.tenantId}
                onValueChange={(value) => setFilters({ ...filters, tenantId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Tenants</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.tenantName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DataTable columns={columns} data={filteredBranches} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
