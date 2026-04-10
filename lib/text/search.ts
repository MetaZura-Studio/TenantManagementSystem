export function normalizeForSearch(input: unknown): string {
  if (input == null) return ""
  // Normalize to improve matching across unicode forms (Arabic chars, composed forms, etc.)
  // NFKC is generally safe for search normalization.
  const s = String(input).normalize("NFKC")
  return s.toLocaleLowerCase().trim()
}

export function matchesSearch(haystack: Array<unknown>, needle: string): boolean {
  const q = normalizeForSearch(needle)
  if (!q) return true
  const joined = haystack.map(normalizeForSearch).filter(Boolean).join(" ")
  return joined.includes(q)
}

