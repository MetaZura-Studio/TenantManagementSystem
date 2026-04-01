import { requireSession } from "@/app/api/_platform/auth"
import { jsonError, jsonOk } from "@/app/api/_platform/http"
import { prisma } from "@/lib/server/prisma"
import type { CurrencyRate } from "@/features/currency/types"

export const runtime = "nodejs"

const BASE_CURRENCY_CODE = "KWD"
const BASE_CURRENCY_NAME_EN = "Kuwaiti Dinar"

// Legacy in-app seed list (kept so existing demo currencies remain available).
// IMPORTANT: We store exchange_rate as **KWD per 1 unit of currency**.
// Example: if 1 USD = 0.31 KWD, then USD.exchange_rate = 0.31.
const LEGACY_USD_RATES: Array<{ code: string; nameEn: string; perUsd: number }> = [
  { code: "USD", nameEn: "United States Dollar", perUsd: 1.0 },
  { code: "EUR", nameEn: "Euro", perUsd: 0.95 },
  { code: "GBP", nameEn: "British Pound", perUsd: 0.82 },
  { code: "JPY", nameEn: "Japanese Yen", perUsd: 150.0 },
  // This legacy value represents 1 USD = 0.31 KWD.
  { code: "KWD", nameEn: "Kuwaiti Dinar", perUsd: 0.31 },
]

function legacyToKwdPerUnit(code: string): number {
  const kwdPerUsd = LEGACY_USD_RATES.find((x) => x.code === "KWD")?.perUsd ?? 0.31
  if (code === "KWD") return 1
  // perUsd means "1 USD = X <currency>"
  // so "1 <currency> = (1 / X) USD" then multiply by (KWD per USD)
  const perUsd = LEGACY_USD_RATES.find((x) => x.code === code)?.perUsd ?? 1
  const usdPerUnit = perUsd ? 1 / perUsd : 0
  return Number((usdPerUnit * kwdPerUsd).toFixed(6))
}

function rowToCurrencyRate(row: any): CurrencyRate {
  return {
    id: String(row.code),
    currencyCode: String(row.code),
    currencyName: String(row.name_en),
    exchangeRate: Number(row.exchange_rate ?? 0),
    lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : undefined,
  }
}

async function ensureBaseCurrency() {
  const existing = await prisma.currencies.findUnique({
    where: { code: BASE_CURRENCY_CODE },
    select: { code: true },
  })
  if (existing?.code) return

  const now = new Date()
  await prisma.currencies.create({
    data: {
      code: BASE_CURRENCY_CODE,
      name_en: BASE_CURRENCY_NAME_EN,
      name_ar: null,
      exchange_rate: 1,
      last_updated: now,
      created_at: now,
      created_by: null,
      updated_at: now,
      updated_by: null,
    } as any,
  })
}

async function ensureLegacyCurrenciesSeeded() {
  const now = new Date()
  const legacyCodes = LEGACY_USD_RATES.map((x) => x.code)

  // Seed/update names + insert missing rows.
  // Do NOT overwrite existing exchange rates, except:
  // - Always force KWD exchange_rate = 1
  // - Normalize legacy demo values if they match the old UI (USD=1, EUR=0.95, GBP=0.82, JPY=150)
  //   which were USD-based; convert them to KWD-per-unit once.
  const existing = await prisma.currencies.findMany({
    where: { code: { in: legacyCodes } },
    select: { code: true, exchange_rate: true },
  })
  const existingRateByCode = new Map(existing.map((r) => [r.code, Number(r.exchange_rate ?? 0)]))

  const shouldNormalizeLegacyUsdBased =
    existingRateByCode.get("USD") === 1 &&
    existingRateByCode.get("EUR") === 0.95 &&
    existingRateByCode.get("GBP") === 0.82 &&
    existingRateByCode.get("JPY") === 150

  await prisma.$transaction(
    LEGACY_USD_RATES.map((c) =>
      prisma.currencies.upsert({
        where: { code: c.code },
        create: {
          code: c.code,
          name_en: c.nameEn,
          name_ar: null,
          exchange_rate: c.code === BASE_CURRENCY_CODE ? 1 : legacyToKwdPerUnit(c.code),
          last_updated: now,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null,
        } as any,
        update: {
          name_en: c.nameEn,
          ...(c.code === BASE_CURRENCY_CODE
            ? { exchange_rate: 1 }
            : shouldNormalizeLegacyUsdBased
              ? { exchange_rate: legacyToKwdPerUnit(c.code), last_updated: now }
              : {}),
          updated_at: now,
        } as any,
      })
    )
  )
}

export async function GET() {
  const auth = requireSession()
  if (!auth.ok) return auth.response

  await ensureBaseCurrency()
  await ensureLegacyCurrenciesSeeded()

  const rows = await prisma.currencies.findMany({
    orderBy: [{ code: "asc" }],
  })

  // KWD always first
  const mapped = rows.map(rowToCurrencyRate)
  mapped.sort((a, b) => {
    if (a.currencyCode === BASE_CURRENCY_CODE) return -1
    if (b.currencyCode === BASE_CURRENCY_CODE) return 1
    return a.currencyCode.localeCompare(b.currencyCode)
  })

  return jsonOk(mapped)
}

export async function POST(req: Request) {
  const auth = requireSession()
  if (!auth.ok) return auth.response

  let body: any
  try {
    body = await req.json()
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  const codeRaw = String(body?.currencyCode ?? body?.code ?? "").trim().toUpperCase()
  const nameEn = String(body?.currencyName ?? body?.nameEn ?? "").trim()
  const nameAr = String(body?.nameAr ?? "").trim()
  const exchangeRate = Number(body?.exchangeRate)

  if (!codeRaw) return jsonError(400, "BAD_REQUEST", "Currency code is required")
  if (!nameEn) return jsonError(400, "BAD_REQUEST", "Currency name is required")
  if (!Number.isFinite(exchangeRate) || exchangeRate < 0) {
    return jsonError(400, "BAD_REQUEST", "Exchange rate must be a non-negative number")
  }

  const now = new Date()

  // Enforce base currency invariants
  if (codeRaw === BASE_CURRENCY_CODE) {
    return jsonError(400, "BAD_REQUEST", "KWD is the base currency and cannot be created/overridden here")
  }

  try {
    const created = await prisma.currencies.create({
      data: {
        code: codeRaw,
        name_en: nameEn,
        name_ar: nameAr || null,
        exchange_rate: exchangeRate,
        last_updated: now,
        created_at: now,
        created_by: null,
        updated_at: now,
        updated_by: null,
      } as any,
    })
    return jsonOk(rowToCurrencyRate(created))
  } catch (e: any) {
    if (e?.code === "P2002") {
      return jsonError(400, "BAD_REQUEST", "Currency code already exists")
    }
    return jsonError(400, "BAD_REQUEST", e?.message || "Failed to create currency")
  }
}

