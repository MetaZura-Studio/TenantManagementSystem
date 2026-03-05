"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PageHeaderV2 } from "@/components/page-header-v2"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { tenantsApi } from "@/lib/api"
import { Eye, Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TenantDetailsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  const router = useRouter()

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => tenantsApi.getById(tenantId),
  })

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-8">Loading...</div>
      </AppShell>
    )
  }

  if (!tenant) {
    return (
      <AppShell>
        <div className="text-center py-8">Tenant not found</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeaderV2
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

      <div className="space-y-6">
        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Tenant Summary</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Tenant Name</p>
              <p className="text-lg font-medium">{tenant.tenantName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <p className="text-lg font-medium">{tenant.tenantId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={tenant.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subscription Status</p>
              <StatusBadge status={tenant.subscriptionStatus} />
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
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default">
          <GlassCardHeader>
            <GlassCardTitle>Owner Information</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Owner Name</p>
              <p className="text-lg font-medium">{tenant.ownerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner Email</p>
              <p className="text-lg font-medium">{tenant.ownerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner Phone</p>
              <p className="text-lg font-medium">{tenant.ownerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner Type</p>
              <p className="text-lg font-medium">{tenant.ownerType}</p>
            </div>
          </div>
          </GlassCardContent>
        </GlassCard>

        {tenant.remarks && (
          <GlassCard variant="subtle">
            <GlassCardHeader>
              <GlassCardTitle>Remarks</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-muted-foreground">{tenant.remarks}</p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </AppShell>
  )
}
