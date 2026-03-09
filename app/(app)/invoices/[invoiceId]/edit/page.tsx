import { EditInvoicePage } from "@/features/invoices/pages/EditInvoicePage"

export default function EditInvoiceRoute({
  params,
}: {
  params: { invoiceId: string }
}) {
  const { invoiceId } = params
  return <EditInvoicePage invoiceId={invoiceId} />
}
