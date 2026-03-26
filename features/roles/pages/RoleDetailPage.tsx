"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useRole } from "../hooks"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSession } from "@/lib/auth/useSession"
import { PERMISSIONS, hasPermissionForSession } from "@/lib/auth/permissions"

interface RoleDetailPageProps {
  roleId: string
}

export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const router = useRouter()
  const { data: role, isLoading } = useRole(roleId)
  const { session } = useSession()
  const canUpdate = hasPermissionForSession(session, PERMISSIONS.ROLES.UPDATE)

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!role) {
    return <div className="text-center py-8">Role not found</div>
  }

  return (
    <>
      <PageHeader
        title="Role Details"
        subtitle={role.roleName}
        breadcrumbs={[
          { label: "Roles", href: "/roles" },
          { label: "Role Details" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Link href={`/roles/${roleId}/edit`}>
              <Button size="lg" disabled={!canUpdate}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Role
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Role Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Role Name</p>
                <p className="text-lg font-medium">{role.roleName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={role.status} />
              </div>
              {role.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-lg font-medium">{role.description}</p>
                </div>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Permissions</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-2">
              {role.permissions.map((permission) => (
                <div key={permission.module} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="font-medium">{permission.module}</div>
                  <div className="flex gap-4">
                    <span className={permission.view ? "text-green-600" : "text-gray-400"}>View</span>
                    <span className={permission.create ? "text-green-600" : "text-gray-400"}>Create</span>
                    <span className={permission.edit ? "text-green-600" : "text-gray-400"}>Edit</span>
                    <span className={permission.delete ? "text-green-600" : "text-gray-400"}>Delete</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </>
  )
}
