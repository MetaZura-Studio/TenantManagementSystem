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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InvoiceLine> }) =>
      invoiceLinesApi.update(id, updates),
    onSuccess: (_, variables) => {
      const line = variables.updates
      if (line?.invoiceId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.invoices.detail(line.invoiceId), "lines"],
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(line.invoiceId) })
      }
    },
  })
}

export function useDeleteInvoiceLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId: string }) =>
      invoiceLinesApi.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.invoices.detail(variables.invoiceId), "lines"],
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId) })
    },
  })
}
