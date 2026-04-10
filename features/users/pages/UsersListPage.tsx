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
import { useUsers, useDeleteUser } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useBranches } from "@/features/branches/hooks"
import { useRoles } from "@/features/roles/hooks"
import type { User } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"
import Link from "next/link"

export function UsersListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const { data: users = [], isLoading } = useUsers()
  const { data: tenants = [] } = useTenants()
  const { data: branches = [] } = useBranches()
  const { data: roles = [] } = useRoles()
  const deleteMutation = useDeleteUser()

  const handleDelete = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "User deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete user",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "fullNameEn",
      header: "Full Name (EN)",
    },
    {
      accessorKey: "fullNameAr",
      header: "Full Name (AR)",
    },
    {
      id: "tenant",
      header: "Tenant",
      cell: ({ row }) => {
        const user = row.original
        const tenant = tenants.find((t) => t.id === user.tenantId)
        return tenant ? tenant.shopNameEn : "-"
      },
    },
    {
      id: "branch",
      header: "Branch",
      cell: ({ row }) => {
        const user = row.original
        if (!user.branchId) return "Main branch"
        const branch = branches.find((b) => b.id === user.branchId)
        return branch ? branch.nameEn : "-"
      },
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original
        const role = roles.find((r) => r.id === user.roleId)
        return role ? role.roleName : "-"
      },
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
        const user = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/users/${user.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(user.id)}
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
        title="Users List"
        subtitle="Manage system users"
        breadcrumbs={[{ label: "Users" }]}
        actions={
          <Button onClick={() => router.push("/users/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        }
      />

      <GlassCard variant="default">
        <GlassCardContent className="p-0">
          <DataTable
            loading={isLoading}
            loadingRows={8}
            loadingCols={8}
            columns={columns}
            data={users}
            search={{ columnId: "username", placeholder: "Search users..." }}
            sort={{
              options: [
                { label: "Username", columnId: "username" },
                { label: "Email", columnId: "email" },
                { label: "Status", columnId: "status" },
              ],
              defaultColumnId: "username",
              defaultDirection: "asc",
            }}
          />
        </GlassCardContent>
      </GlassCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
