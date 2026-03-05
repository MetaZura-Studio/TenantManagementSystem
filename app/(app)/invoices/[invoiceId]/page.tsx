import { use } from "react"
import { InvoiceDetailPage } from "@/features/invoices/pages/InvoiceDetailPage"

export default function InvoiceDetailsRoute({
  params,
}: {
  params: Promise<{ invoiceId: string }>
}) {
  const { invoiceId } = use(params)
  return <InvoiceDetailPage invoiceId={invoiceId} />
}
