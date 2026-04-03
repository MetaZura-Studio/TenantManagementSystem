import type { Invoice, InvoiceLine } from "@/features/invoices/types"

function pdfEscapeText(text: string) {
  // Escape backslash and parentheses for PDF literal strings.
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

/**
 * Styled PDF generator (single page, Helvetica, basic shapes + table).
 * Goal: a “proper invoice” layout without adding dependencies.
 */
export function generateInvoicePdfBytes(args: {
  invoice: Invoice
  lines: InvoiceLine[]
  title?: string
}): Uint8Array {
  const { invoice, lines, title } = args

  // PDF coordinates are bottom-left origin.
  const content: string[] = []

  const PAGE_W = 612
  const PAGE_H = 792
  const M = 48
  const usableW = PAGE_W - M * 2

  const money = (n: number) => `${invoice.currencyCode} ${Number(n || 0).toFixed(2)}`

  // helpers
  const setFill = (r: number, g: number, b: number) => content.push(`${r} ${g} ${b} rg`)
  const setStroke = (r: number, g: number, b: number) => content.push(`${r} ${g} ${b} RG`)
  const rectFill = (x: number, y: number, w: number, h: number) => content.push(`${x} ${y} ${w} ${h} re f`)
  const rectStroke = (x: number, y: number, w: number, h: number) => content.push(`${x} ${y} ${w} ${h} re S`)
  const line = (x1: number, y1: number, x2: number, y2: number) => content.push(`${x1} ${y1} m ${x2} ${y2} l S`)
  const text = (x: number, y: number, size: number, str: string) => {
    content.push("BT")
    content.push(`/F1 ${size} Tf`)
    content.push(`${x} ${y} Td`)
    content.push(`(${pdfEscapeText(str)}) Tj`)
    content.push("ET")
  }
  const textRight = (xRight: number, y: number, size: number, str: string) => {
    // crude right-align using average width approximation (Helvetica ~0.52em)
    const w = str.length * size * 0.52
    text(Math.max(M, xRight - w), y, size, str)
  }

  // Background
  setFill(1, 1, 1)
  rectFill(0, 0, PAGE_W, PAGE_H)

  // Header bands (navy + accent)
  setFill(0.05, 0.16, 0.22)
  rectFill(0, PAGE_H - 120, PAGE_W, 120)
  setFill(0.72, 0.46, 0.25)
  rectFill(0, PAGE_H - 126, PAGE_W, 6)

  // Logo box + company
  setFill(0.08, 0.25, 0.34)
  rectFill(M, PAGE_H - 98, 34, 34)
  setFill(1, 1, 1)
  text(M + 12, PAGE_H - 86, 16, "P")
  text(M + 50, PAGE_H - 86, 12, "COMPANY NAME")

  // Invoice label
  setFill(1, 1, 1)
  setStroke(1, 1, 1)
  rectStroke(PAGE_W - M - 140, PAGE_H - 90, 140, 34)
  text(PAGE_W - M - 112, PAGE_H - 78, 16, (title || "INVOICE").toUpperCase())

  // Customer + invoice meta blocks
  const blockTop = PAGE_H - 160
  setFill(0.96, 0.97, 0.98)
  rectFill(M, blockTop - 92, usableW, 92)
  setStroke(0.9, 0.92, 0.94)
  rectStroke(M, blockTop - 92, usableW, 92)

  setFill(0.05, 0.05, 0.05)
  text(M + 16, blockTop - 26, 10, "INVOICE TO:")
  text(M + 16, blockTop - 42, 10, `${invoice.tenantId}`)
  text(M + 16, blockTop - 58, 9, `EMAIL: ${invoice.createdBy || "-"}`)
  text(M + 16, blockTop - 72, 9, `ADDRESS: ${invoice.notes || "-"}`)

  const metaX = PAGE_W - M - 220
  setFill(0.08, 0.25, 0.34)
  rectFill(metaX, blockTop - 72, 220, 72)
  setFill(1, 1, 1)
  text(metaX + 14, blockTop - 22, 10, `INVOICE NO: ${invoice.invoiceCode}`)
  text(metaX + 14, blockTop - 40, 10, `DATE: ${invoice.issueDate}`)
  text(metaX + 14, blockTop - 58, 10, `DUE: ${invoice.dueDate || "-"}`)

  // Total pill
  setFill(0.05, 0.16, 0.22)
  rectFill(metaX + 14, blockTop - 92, 88, 18)
  setFill(1, 1, 1)
  text(metaX + 38, blockTop - 88, 10, "TOTAL")
  textRight(metaX + 220 - 14, blockTop - 88, 10, money(invoice.totalAmount))

  // Table
  const tableTop = blockTop - 120
  const rowH = 22
  const col = {
    sl: M,
    desc: M + 44,
    price: M + 330,
    qty: M + 410,
    total: M + 472,
    right: M + usableW,
  }

  // header row
  setFill(0.72, 0.46, 0.25)
  rectFill(M, tableTop, usableW, rowH)
  setFill(1, 1, 1)
  text(col.sl + 10, tableTop + 7, 10, "SL")
  text(col.desc + 10, tableTop + 7, 10, "DESCRIPTION")
  text(col.price + 10, tableTop + 7, 10, "PRICE")
  text(col.qty + 10, tableTop + 7, 10, "QTY")
  text(col.total + 10, tableTop + 7, 10, "TOTAL")

  // grid border + verticals
  setStroke(0.15, 0.15, 0.15)
  rectStroke(M, tableTop - rowH * 10, usableW, rowH * 11)
  line(col.desc, tableTop - rowH * 10, col.desc, tableTop + rowH)
  line(col.price, tableTop - rowH * 10, col.price, tableTop + rowH)
  line(col.qty, tableTop - rowH * 10, col.qty, tableTop + rowH)
  line(col.total, tableTop - rowH * 10, col.total, tableTop + rowH)

  const renderedLines = lines
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 10)

  for (let i = 0; i < 10; i++) {
    const y = tableTop - rowH * (i + 1)
    if (i % 2 === 1) {
      setFill(0.95, 0.95, 0.95)
      rectFill(M, y, usableW, rowH)
    }
    const l = renderedLines[i]
    if (l) {
      const qty = Number.isFinite(l.quantity) ? l.quantity : 0
      const unit = Number.isFinite(l.unitPrice) ? l.unitPrice : 0
      const amount = qty * unit
      setFill(0.05, 0.05, 0.05)
      text(col.sl + 12, y + 7, 9, String(i + 1))
      text(col.desc + 10, y + 7, 9, String(l.description || l.lineType).slice(0, 40))
      textRight(col.qty - 10, y + 7, 9, unit.toFixed(2))
      textRight(col.total - 10, y + 7, 9, String(qty))
      textRight(col.right - 10, y + 7, 9, amount.toFixed(2))
    }
  }

  // Totals block
  const totalsY = tableTop - rowH * 11 - 16
  setFill(0.72, 0.46, 0.25)
  rectFill(PAGE_W - M - 180, totalsY, 180, 20)
  setFill(1, 1, 1)
  text(PAGE_W - M - 118, totalsY + 6, 10, "TOTAL")
  textRight(PAGE_W - M - 10, totalsY + 6, 10, money(invoice.totalAmount))

  setFill(0.05, 0.05, 0.05)
  text(PAGE_W - M - 180, totalsY - 18, 9, "DISC:")
  text(PAGE_W - M - 180, totalsY - 34, 9, "VAT:")
  text(PAGE_W - M - 180, totalsY - 50, 9, "GRAND TOTAL")
  textRight(PAGE_W - M - 10, totalsY - 50, 10, money(invoice.totalAmount))

  // Footer band
  setFill(0.05, 0.16, 0.22)
  rectFill(0, 0, PAGE_W, 70)
  setFill(0.72, 0.46, 0.25)
  rectFill(0, 70, PAGE_W, 6)
  setFill(1, 1, 1)
  text(M, 26, 9, "Your website name")
  text(M, 12, 9, "Your email name")

  // Signature line
  setStroke(1, 1, 1)
  line(M, 86, M + 120, 86)
  setFill(1, 1, 1)
  text(M, 72, 9, "SIGNATURE")

  const stream = content.join("\n") + "\n"

  // Build a very small PDF with 4 objects: catalog, pages, page, font, content.
  // We’ll create object 4 as font, 5 as content. (PDF objects are 1-indexed here.)
  const parts: string[] = []
  parts.push("%PDF-1.4\n")

  const xref: number[] = [0]
  function addObject(objNum: number, body: string) {
    xref[objNum] = parts.join("").length
    parts.push(`${objNum} 0 obj\n${body}\nendobj\n`)
  }

  addObject(
    1,
    `<< /Type /Catalog /Pages 2 0 R >>`
  )
  addObject(
    2,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`
  )
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`
  )
  addObject(
    4,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`
  )
  addObject(
    5,
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`
  )

  const xrefStart = parts.join("").length
  const size = 6
  let xrefTable = "xref\n0 " + size + "\n"
  xrefTable += "0000000000 65535 f \n"
  for (let i = 1; i < size; i++) {
    const offset = xref[i] ?? 0
    xrefTable += offset.toString().padStart(10, "0") + " 00000 n \n"
  }
  parts.push(xrefTable)

  parts.push(
    `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  )

  const pdfText = parts.join("")
  return new TextEncoder().encode(pdfText)
}

