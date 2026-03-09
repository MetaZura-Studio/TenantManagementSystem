import { InvoiceDetailPage } from "@/features/invoices/pages/InvoiceDetailPage"

export default function InvoiceDetailsRoute({
  params,
}: {
  params: { invoiceId: string }
}) {
  const { invoiceId } = params
  return <InvoiceDetailPage invoiceId={invoiceId} />
}
