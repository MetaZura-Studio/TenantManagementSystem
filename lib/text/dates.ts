function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const s = String(value).trim()
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export function formatDateYmd(value: unknown): string {
  const d = toDate(value)
  if (!d) return "—"
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function formatDateTimeYmdHm(value: unknown): string {
  const d = toDate(value)
  if (!d) return "—"
  return `${formatDateYmd(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

