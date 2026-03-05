"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/feedback"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useRoles, useDeleteRole } from "../hooks"
import type { Role } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus } from "lucide-react"
import Link from "next/link"

export function RolesListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)

  const { data: roles = [], isLoading } = useRoles()
  const deleteMutation = useDeleteRole()

  const handleDelete = (id: string) => {
    setRoleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Role deleted successfully",
          })
          setDeleteDialogOpen(false)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete role",
            variant: "destructive",
          })
        },
      })
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "roleName",
      header: "Role Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex items-center space-x-2">
            <Link href={`/roles/${role.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(role.id)}
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
        title="Roles List"
        subtitle="Manage user roles and permissions"
        breadcrumbs={[{ label: "Roles" }]}
        actions={
          <Button onClick={() => router.push("/roles/new")} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        }
      />

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={roles} />
          </GlassCardContent>
        </GlassCard>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
