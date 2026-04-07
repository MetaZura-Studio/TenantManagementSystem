"use client"

import { useSession } from "@/lib/auth/useSession"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BreadcrumbItem } from "@/components/shared/breadcrumbs/Breadcrumbs"

export default function ProfilePage() {
  const { session, loading } = useSession()

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Profile" }]

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const user = session?.user

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Admin account details"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-2xl">
        <GlassCard variant="default" className="rounded-3xl">
          <GlassCardHeader>
            <GlassCardTitle>Profile</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={user?.name ?? ""}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={user?.email ?? ""}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input
                id="profile-role"
                value={user?.role ?? ""}
                readOnly
              />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </>
  )
}

