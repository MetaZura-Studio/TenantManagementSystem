import { requireSession } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { CurrencyRate } from "@/features/currency/types"

export const runtime = "nodejs"

const BASE_CURRENCY_CODE = "KWD"

function rowToCurrencyRate(row: any): CurrencyRate {
  return {
    id: String(row.code),
    currencyCode: String(row.code),
    currencyName: String(row.name_en),
    exchangeRate: Number(row.exchange_rate ?? 0),
    lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : undefined,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { code: string } }
) {
  const auth = requireSession()
  if (!auth.ok) return auth.response

  const code = String(params.code || "").trim().toUpperCase()
  if (!code) return jsonError(400, "BAD_REQUEST", "Currency code is required")

  if (code === BASE_CURRENCY_CODE) {
    return jsonError(400, "BAD_REQUEST", "KWD is the base currency and its rate cannot be changed")
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const exchangeRate = body?.exchangeRate != null ? Number(body.exchangeRate) : null
  const nameEn = body?.currencyName != null ? String(body.currencyName).trim() : null
  const nameAr = body?.nameAr != null ? String(body.nameAr).trim() : null

  if (exchangeRate == null && nameEn == null && nameAr == null) {
    return jsonError(400, "BAD_REQUEST", "No updates provided")
  }
  if (exchangeRate != null && (!Number.isFinite(exchangeRate) || exchangeRate < 0)) {
    return jsonError(400, "BAD_REQUEST", "Exchange rate must be a non-negative number")
  }

  const now = new Date()

  try {
    const updated = await prisma.currencies.update({
      where: { code },
      data: {
        ...(exchangeRate != null ? { exchange_rate: exchangeRate, last_updated: now } : {}),
        ...(nameEn != null ? { name_en: nameEn } : {}),
        ...(nameAr != null ? { name_ar: nameAr || null } : {}),
        updated_at: now,
      } as any,
    })
    return jsonOk(rowToCurrencyRate(updated))
  } catch (e: any) {
    if (e?.code === "P2025") return jsonError(404, "NOT_FOUND", "Currency not found")
    return jsonError(400, "BAD_REQUEST", e?.message || "Failed to update currency")
  }
}

