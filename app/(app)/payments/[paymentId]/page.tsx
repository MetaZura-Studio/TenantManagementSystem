import { PaymentDetailPage } from "@/features/payments/pages/PaymentDetailPage"

export default function PaymentDetailsRoute({
  params,
}: {
  params: { paymentId: string }
}) {
  const { paymentId } = params
  return <PaymentDetailPage paymentId={paymentId} />
}
