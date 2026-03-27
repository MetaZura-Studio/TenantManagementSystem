import type { Invoice, InvoiceLine } from "@/features/invoices/types"

function pdfEscapeText(text: string) {
  // Escape backslash and parentheses for PDF literal strings.
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

/**
 * Minimal PDF generator (single page, Helvetica, text only).
 * Good enough for a deadline "export/status tracking" flow without extra deps.
 */
export function generateInvoicePdfBytes(args: {
  invoice: Invoice
  lines: InvoiceLine[]
  title?: string
}): Uint8Array {
  const { invoice, lines, title } = args

  const contentLines: string[] = []
  contentLines.push("BT")
  contentLines.push("/F1 14 Tf")
  contentLines.push("72 770 Td")
  contentLines.push(`(${pdfEscapeText(title || "Invoice")}) Tj`)
  contentLines.push("0 -18 Td")
  contentLines.push("/F1 10 Tf")
  contentLines.push(`(Invoice Code: ${pdfEscapeText(invoice.invoiceCode)}) Tj`)
  contentLines.push("0 -14 Td")
  contentLines.push(`(Tenant: ${pdfEscapeText(invoice.tenantId)}) Tj`)
  contentLines.push("0 -14 Td")
  contentLines.push(`(Issue Date: ${pdfEscapeText(invoice.issueDate)}) Tj`)
  contentLines.push("0 -14 Td")
  contentLines.push(`(Due Date: ${pdfEscapeText(invoice.dueDate)}) Tj`)
  contentLines.push("0 -20 Td")
  contentLines.push(`(Total: ${invoice.totalAmount.toFixed(2)} ${pdfEscapeText(invoice.currencyCode)}) Tj`)
  contentLines.push("0 -14 Td")
  contentLines.push(`(Paid: ${invoice.paidAmount.toFixed(2)}  Due: ${invoice.amountDue.toFixed(2)}) Tj`)
  contentLines.push("0 -22 Td")
  contentLines.push("/F1 11 Tf")
  contentLines.push("(Lines:) Tj")
  contentLines.push("0 -16 Td")
  contentLines.push("/F1 9 Tf")

  const maxLines = 28
  const renderedLines = lines
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, maxLines)

  for (const l of renderedLines) {
    const qty = Number.isFinite(l.quantity) ? l.quantity : 0
    const unit = Number.isFinite(l.unitPrice) ? l.unitPrice : 0
    const amount = qty * unit
    const row = `${l.lineType}  ${l.description}  x${qty} @ ${unit.toFixed(2)} = ${amount.toFixed(2)}`
    contentLines.push(`(${pdfEscapeText(row)}) Tj`)
    contentLines.push("0 -12 Td")
  }

  if (lines.length > renderedLines.length) {
    contentLines.push(`(${pdfEscapeText(`... and ${lines.length - renderedLines.length} more line(s)`)} ) Tj`)
    contentLines.push("0 -12 Td")
  }

  contentLines.push("ET")

  const stream = contentLines.join("\n") + "\n"

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

