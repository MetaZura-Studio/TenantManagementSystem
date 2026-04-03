import type { Settings } from "@/features/settings/types"

export type FormKey = "tenants" | "users" | "plans" | "tenantSubscriptions"

export type RequiredFieldsMatrix = Partial<
  Record<FormKey, Record<string, boolean>>
>

export function getRequiredFieldsMatrix(settings: Settings[]): RequiredFieldsMatrix {
  const setting = settings.find((s) => s.category === "forms" && s.key === "requiredFields")
  if (!setting?.value) return {}

  try {
    const parsed = JSON.parse(setting.value) as RequiredFieldsMatrix
    if (!parsed || typeof parsed !== "object") return {}
    return parsed
  } catch {
    return {}
  }
}

export function isRequired(
  matrix: RequiredFieldsMatrix,
  form: FormKey,
  field: string,
  fallback = true
) {
  const formFields = matrix?.[form]
  if (!formFields) return fallback
  const v = formFields[field]
  return typeof v === "boolean" ? v : fallback
}

