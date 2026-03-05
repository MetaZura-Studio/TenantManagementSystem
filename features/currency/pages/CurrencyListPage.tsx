"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useCurrencies, useUpdateCurrency } from "../hooks"
import type { CurrencyRate } from "../types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/shared/feedback/use-toast"

export function CurrencyListPage() {
  const { data: currencies = [], isLoading } = useCurrencies()
  const updateMutation = useUpdateCurrency()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate | null>(null)
  const [exchangeRate, setExchangeRate] = useState("")

  const handleEdit = (currency: CurrencyRate) => {
    setSelectedCurrency(currency)
    setExchangeRate(currency.exchangeRate.toString())
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    if (selectedCurrency) {
      updateMutation.mutate(
        {
          id: selectedCurrency.id,
          updates: { exchangeRate: parseFloat(exchangeRate) },
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "Exchange rate updated successfully",
            })
            setEditDialogOpen(false)
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update exchange rate",
              variant: "destructive",
            })
          },
        }
      )
    }
  }

  const columns: ColumnDef<CurrencyRate>[] = [
    {
      accessorKey: "currencyCode",
      header: "Currency Code",
    },
    {
      accessorKey: "currencyName",
      header: "Currency Name",
    },
    {
      accessorKey: "exchangeRate",
      header: "Exchange Rate",
      cell: ({ row }) => row.original.exchangeRate.toFixed(4),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const currency = row.original
        return (
          <Button variant="ghost" size="icon" onClick={() => handleEdit(currency)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Currency Lookup"
        subtitle="Manage currency exchange rates"
        breadcrumbs={[{ label: "Currency Lookup" }]}
      />

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default">
          <GlassCardContent className="p-0">
            <DataTable columns={columns} data={currencies} />
          </GlassCardContent>
        </GlassCard>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exchange Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Currency</Label>
              <p className="text-sm text-muted-foreground">
                {selectedCurrency?.currencyCode} - {selectedCurrency?.currencyName}
              </p>
            </div>
            <div>
              <Label htmlFor="exchangeRate">Exchange Rate</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
