"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Settings } from "@/features/settings/types"
import { cn } from "@/lib/utils"
import { getRequiredFieldsMatrix, type FormKey, type RequiredFieldsMatrix } from "@/lib/forms/required-fields"

const FORMS: Array<{
  key: FormKey
  label: string
  fields: Array<{ key: string; label: string }>
}> = [
  {
    key: "tenants",
    label: "Tenants",
    fields: [
      { key: "tenantCode", label: "Tenant Code" },
      { key: "slug", label: "Slug" },
      { key: "shopNameEn", label: "Shop Name (EN)" },
      { key: "shopNameAr", label: "Shop Name (AR)" },
      { key: "ownerName", label: "Owner Name" },
      { key: "ownerEmail", label: "Owner Email" },
      { key: "ownerMobile", label: "Owner Mobile" },
      { key: "tenantType", label: "Tenant Type" },
      { key: "invoicePrefix", label: "Invoice Prefix" },
      { key: "logo", label: "Tenant Logo" },
      { key: "contactPerson", label: "Contact Person" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "zipCode", label: "Zip Code" },
      { key: "country", label: "Country" },
      { key: "timezone", label: "Timezone" },
      { key: "subscriptionStatus", label: "Subscription Status" },
      { key: "subscriptionStartDate", label: "Subscription Start Date" },
      { key: "subscriptionEndDate", label: "Subscription End Date" },
      { key: "lockedAt", label: "Locked At" },
      { key: "suspensionReason", label: "Suspension Reason" },
    ],
  },
  {
    key: "users",
    label: "Users",
    fields: [
      { key: "tenantId", label: "Tenant" },
      { key: "branchId", label: "Branch" },
      { key: "roleId", label: "Role" },
      { key: "username", label: "Username" },
      { key: "email", label: "Email" },
      { key: "mobile", label: "Mobile" },
      { key: "password", label: "Password" },
      { key: "fullNameEn", label: "Full Name (EN)" },
      { key: "fullNameAr", label: "Full Name (AR)" },
      { key: "status", label: "Status" },
      { key: "address", label: "Address" },
      { key: "zipCode", label: "Zip Code" },
      { key: "country", label: "Country" },
    ],
  },
  {
    key: "plans",
    label: "Plans",
    fields: [
      { key: "planCode", label: "Plan Code" },
      { key: "nameEn", label: "Name (EN)" },
      { key: "nameAr", label: "Name (AR)" },
      { key: "description", label: "Description" },
      { key: "billingCycle", label: "Billing Cycle" },
      { key: "currencyCode", label: "Currency" },
      { key: "monthlyPrice", label: "Monthly Price" },
      { key: "yearlyPrice", label: "Yearly Price" },
      { key: "maxBranches", label: "Max Branches" },
      { key: "maxUsers", label: "Max Users" },
      { key: "featuresJson", label: "Features (JSON)" },
      { key: "isActive", label: "Active" },
    ],
  },
  {
    key: "tenantSubscriptions",
    label: "Tenant Subscriptions",
    fields: [
      { key: "tenantId", label: "Tenant" },
      { key: "planId", label: "Plan" },
      { key: "status", label: "Status" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "currentPeriodStart", label: "Current Period Start" },
      { key: "currentPeriodEnd", label: "Current Period End" },
      { key: "billingCurrency", label: "Billing Currency" },
      { key: "unitPrice", label: "Unit Price" },
      { key: "discountAmount", label: "Discount Amount" },
      { key: "discountPercent", label: "Discount Percent" },
      { key: "autoRenew", label: "Auto Renew" },
      { key: "cancelAtPeriodEnd", label: "Cancel at Period End" },
      { key: "canceledAt", label: "Canceled At" },
      { key: "trialStart", label: "Trial Start" },
      { key: "trialEnd", label: "Trial End" },
      { key: "notes", label: "Notes" },
    ],
  },
]

function cloneMatrix(m: RequiredFieldsMatrix): RequiredFieldsMatrix {
  return JSON.parse(JSON.stringify(m || {})) as RequiredFieldsMatrix
}

function defaultMatrix(): RequiredFieldsMatrix {
  const out: RequiredFieldsMatrix = {}
  for (const form of FORMS) {
    out[form.key] = {}
    for (const f of form.fields) {
      // Sensible defaults: most fields required; obvious “optional” fields default to optional.
      const optionalDefaults = new Set([
        "logo",
        "description",
        "featuresJson",
        "address",
        "zipCode",
        "country",
        "branchId",
        "notes",
        "discountAmount",
        "discountPercent",
        "canceledAt",
        "trialStart",
        "trialEnd",
        "endDate",
        "lockedAt",
        "suspensionReason",
        "subscriptionStartDate",
        "subscriptionEndDate",
      ])
      out[form.key]![f.key] = !optionalDefaults.has(f.key)
    }
  }
  return out
}

function mergeWithDefaults(input: RequiredFieldsMatrix): RequiredFieldsMatrix {
  const base = defaultMatrix()
  const out = cloneMatrix(base)
  for (const form of Object.keys(input || {}) as FormKey[]) {
    out[form] = { ...(out[form] || {}), ...(input[form] || {}) }
  }
  return out
}

export function FormRequirementsSettings(props: {
  settings: Settings[]
  valueOverride?: string
  onSave: (newJson: string) => void
  isSaving?: boolean
}) {
  const raw = props.valueOverride ?? props.settings.find((s) => s.category === "forms" && s.key === "requiredFields")?.value ?? ""

  const initial = useMemo(() => {
    try {
      const parsed = raw ? (JSON.parse(raw) as RequiredFieldsMatrix) : getRequiredFieldsMatrix(props.settings)
      return mergeWithDefaults(parsed)
    } catch {
      return mergeWithDefaults(getRequiredFieldsMatrix(props.settings))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [matrix, setMatrix] = useState<RequiredFieldsMatrix>(cloneMatrix(initial))
  const defaultForm = FORMS[0]?.key ?? "tenants"

  const setField = (form: FormKey, field: string, required: boolean) => {
    setMatrix((prev) => {
      const next = cloneMatrix(prev)
      if (!next[form]) next[form] = {}
      next[form]![field] = required
      return next
    })
  }

  const save = () => {
    props.onSave(JSON.stringify(matrix, null, 2))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Form Requirements</h3>
        <p className="text-sm text-muted-foreground">
          Toggle which fields are required per form. These switches affect validation across the app.
        </p>
      </div>

      <Tabs defaultValue={defaultForm} className="w-full">
        <div className="rounded-2xl border border-border/30 bg-white/50 p-2 overflow-x-auto">
          <TabsList className="w-max min-w-full bg-transparent p-0 h-auto justify-start rounded-none gap-1">
            {FORMS.map((f) => (
              <TabsTrigger
                key={f.key}
                value={f.key}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm whitespace-nowrap",
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm"
                )}
              >
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          {FORMS.map((f) => (
            <TabsContent key={f.key} value={f.key} className="m-0 space-y-4">
              <div className="grid gap-3">
                {f.fields.map((field) => {
                  const required = !!matrix?.[f.key]?.[field.key]
                  return (
                    <div
                      key={`${f.key}.${field.key}`}
                      className="rounded-2xl border border-border/30 bg-white/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{field.label}</Label>
                          <p className="text-xs text-muted-foreground">
                            {required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <Switch
                          checked={required}
                          onCheckedChange={(checked) => setField(f.key, field.key, checked)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={props.isSaving} className="rounded-2xl px-6">
          {props.isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

