import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import type { Invoice } from "@/features/invoices/types"
import { createInvoice, createInvoiceLine, listInvoices } from "./_store"
import { getMysqlPool } from "@/lib/server/mysql"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.INVOICES.VIEW)
  if (!auth.ok) return auth.response
  return jsonOk(await listInvoices())
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

  try {
    // If the UI didn't compute totals, derive them from the selected subscription.
    let derivedCurrency = body.currencyCode
    let derivedTotal = Number(body.totalAmount ?? 0)
    let derivedTax = Number(body.taxAmount ?? 0)
    let derivedDiscount = Number(body.discountAmount ?? 0)

    let subscriptionMeta:
      | {
          subscription_code: string
          tenant_id: number
          plan_id: number
          billing_currency_code: string
          unit_price: number
          plan_name_en: string | null
        }
      | null = null

    if (body.subscriptionId) {
      const pool = getMysqlPool()
      const subId = Number.parseInt(String(body.subscriptionId), 10)
      if (Number.isFinite(subId)) {
        const [rows] = await pool.query(
          `
          SELECT
            ts.subscription_code,
            ts.tenant_id,
            ts.plan_id,
            ts.billing_currency_code,
            ts.unit_price,
            p.name_en AS plan_name_en
          FROM tenant_subscriptions ts
          LEFT JOIN plans p ON p.id = ts.plan_id
          WHERE ts.id = ?
          LIMIT 1
          `,
          [subId]
        )
        subscriptionMeta = (rows as any[])[0] ?? null
      }
    }

    if (subscriptionMeta) {
      // Guard: prevent mismatched tenant/subscription pairing.
      if (String(subscriptionMeta.tenant_id) !== String(body.tenantId)) {
        return jsonError(400, "BAD_REQUEST", "Subscription does not belong to selected tenant")
      }

      derivedCurrency = derivedCurrency || subscriptionMeta.billing_currency_code

      // Only override totals if they are empty/zero.
      if (!Number.isFinite(derivedTotal) || derivedTotal === 0) {
        derivedTotal = Number(subscriptionMeta.unit_price ?? 0)
      }
    }

    const paid = Number(body.paidAmount ?? 0)
    const amountDue =
      Number.isFinite(body.amountDue) && Number(body.amountDue) > 0
        ? Number(body.amountDue)
        : Math.max(0, derivedTotal - paid)

    const created = await createInvoice({
      ...body,
      currencyCode: derivedCurrency || body.currencyCode || "USD",
      totalAmount: derivedTotal,
      taxAmount: derivedTax,
      discountAmount: derivedDiscount,
      paidAmount: paid,
      amountDue,
    })

    // Create a default line item if none exists (subscription charge).
    if (subscriptionMeta && derivedTotal > 0) {
      await createInvoiceLine({
        invoiceId: created.id,
        lineType: "SUBSCRIPTION",
        description: subscriptionMeta.plan_name_en
          ? `Subscription: ${subscriptionMeta.plan_name_en}`
          : `Subscription: ${subscriptionMeta.subscription_code}`,
        quantity: 1,
        unitPrice: derivedTotal,
        sortOrder: 1,
      })
    }

    return jsonOk(created, { status: 201 })
  } catch (err: any) {
    return jsonError(400, "BAD_REQUEST", err?.message ?? "Failed to create invoice")
  }
}

