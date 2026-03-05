import { use } from "react"
import { EditInvoicePage } from "@/features/invoices/pages/EditInvoicePage"

export default function EditInvoiceRoute({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = use(params)
  return <EditInvoicePage invoiceId={invoiceId} />
}
