import { PrintInvoicePage } from "@/features/invoices/pages/PrintInvoicePage"

export default function PrintInvoiceRoute({
  params,
}: {
  params: { invoiceId: string }
}) {
  return <PrintInvoicePage invoiceId={params.invoiceId} />
}

