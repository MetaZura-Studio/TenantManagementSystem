import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Invoice } from "@/features/invoices/types"
import { createInvoice, listInvoices } from "./_store"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.INVOICES.VIEW)
  if (!auth.ok) return auth.response
  return jsonOk(listInvoices())
}

export async function POST(req: Request) {
  const auth = requirePermission(PERMISSIONS.INVOICES.CREATE)
  if (!auth.ok) return auth.response

  let body: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  try {
    body = (await req.json()) as Omit<Invoice, "id" | "createdAt" | "updatedAt">
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  // Minimal validation; UI already validates with Zod.
  if (!body?.invoiceCode || !body?.tenantId || !body?.issueDate || !body?.dueDate) {
    return jsonError(400, "BAD_REQUEST", "Missing required invoice fields")
  }

  const created = createInvoice(body)
  return jsonOk(created, { status: 201 })
}

