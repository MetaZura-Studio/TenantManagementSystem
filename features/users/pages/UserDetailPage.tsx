"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/badges"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useUser } from "../hooks"
import { useTenants } from "@/features/tenants/hooks"
import { useRoles } from "@/features/roles/hooks"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface UserDetailPageProps {
  userId: string
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter()
  const { data: user, isLoading } = useUser(userId)
  const { data: tenants = [] } = useTenants()
  const { data: roles = [] } = useRoles()

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>
  }

  const tenant = tenants.find((t) => t.id === user.tenantId)
  const role = roles.find((r) => r.id === user.roleId)

  return (
    <>
      <PageHeader
        title="User Details"
        subtitle={user.username}
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: "User Details" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Link href={`/users/${userId}/edit`}>
              <Button size="lg">
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>User Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-lg font-medium">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="text-lg font-medium">{user.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={user.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenant</p>
                <p className="text-lg font-medium">{tenant?.shopNameEn || tenant?.tenantCode || user.tenantId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-medium">{role?.roleName || user.roleId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name (EN)</p>
                <p className="text-lg font-medium">{user.fullNameEn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name (AR)</p>
                <p className="text-lg font-medium">{user.fullNameAr}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </>
  )
}
