import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { invoiceLinesApi } from "@/lib/api/invoice-lines.api"
import { queryKeys } from "@/lib/query/queryKeys"
import type { InvoiceLine } from "../types"

export function useInvoiceLines(invoiceId: string) {
  return useQuery({
    queryKey: [...queryKeys.invoices.detail(invoiceId), "lines"],
    queryFn: () => invoiceLinesApi.getByInvoiceId(invoiceId),
    enabled: !!invoiceId,
  })
}

export function useCreateInvoiceLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">) =>
      invoiceLinesApi.create(line),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.invoices.detail(variables.invoiceId), "lines"],
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId) })
    },
  })
}

export function useUpdateInvoiceLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      invoiceId,
      lineId,
      updates,
    }: {
      invoiceId: string
      lineId: string
      updates: Partial<InvoiceLine>
    }) => invoiceLinesApi.update({ invoiceId, lineId, updates }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.invoices.detail(variables.invoiceId), "lines"],
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId) })
    },
  })
}

export function useDeleteInvoiceLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invoiceId, lineId }: { invoiceId: string; lineId: string }) =>
      invoiceLinesApi.delete({ invoiceId, lineId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.invoices.detail(variables.invoiceId), "lines"],
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId) })
    },
  })
}
