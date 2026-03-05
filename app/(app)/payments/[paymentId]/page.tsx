import { use } from "react"
import { PaymentDetailPage } from "@/features/payments/pages/PaymentDetailPage"

export default function PaymentDetailsRoute({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = use(params)
  return <PaymentDetailPage paymentId={paymentId} />
}
