"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { GlassCard, GlassCardContent } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { useCreateCurrency, useCurrencies, useUpdateCurrency } from "../hooks"
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

const BASE_CURRENCY = "KWD"

export function CurrencyListPage() {
  const { data: currencies = [], isLoading } = useCurrencies()
  const updateMutation = useUpdateCurrency()
  const createMutation = useCreateCurrency()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate | null>(null)
  const [exchangeRate, setExchangeRate] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newRate, setNewRate] = useState("1")

  const handleEdit = (currency: CurrencyRate) => {
    setSelectedCurrency(currency)
    setExchangeRate(currency.exchangeRate.toString())
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setNewCode("")
    setNewName("")
    setNewRate("1")
    setAddDialogOpen(true)
  }

  const handleCreate = () => {
    createMutation.mutate(
      {
        currencyCode: newCode.trim().toUpperCase(),
        currencyName: newName.trim(),
        exchangeRate: parseFloat(newRate) || 0,
      },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Currency added successfully" })
          setAddDialogOpen(false)
        },
        onError: (err: any) => {
          toast({
            title: "Error",
            description: err?.message || "Failed to add currency",
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleSave = () => {
    if (selectedCurrency) {
      if (selectedCurrency.currencyCode === BASE_CURRENCY) {
        toast({
          title: "Not allowed",
          description: "KWD is the base currency and cannot be edited.",
          variant: "destructive",
        })
        return
      }
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
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{c.currencyCode}</span>
            {c.currencyCode === BASE_CURRENCY ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Base
              </span>
            ) : null}
          </div>
        )
      },
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
        const isBase = currency.currencyCode === BASE_CURRENCY
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(currency)}
            disabled={isBase}
            title={isBase ? "Base currency (locked)" : "Edit exchange rate"}
          >
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
        actions={
          <Button onClick={handleAdd} size="lg">
            Add Currency
          </Button>
        }
      />

      <GlassCard variant="default">
        <GlassCardContent className="p-0">
          <DataTable
            loading={isLoading}
            loadingRows={10}
            loadingCols={4}
            columns={columns}
            data={currencies}
            search={{ columnId: "currencyCode", placeholder: "Search currencies..." }}
            sort={{
              options: [
                { label: "Currency Code", columnId: "currencyCode" },
                { label: "Currency Name", columnId: "currencyName" },
                { label: "Exchange Rate", columnId: "exchangeRate" },
              ],
              defaultColumnId: "currencyCode",
              defaultDirection: "asc",
            }}
          />
        </GlassCardContent>
      </GlassCard>

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

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCode">Currency Code</Label>
              <Input
                id="newCode"
                placeholder="e.g. AED"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="newName">Currency Name</Label>
              <Input
                id="newName"
                placeholder="e.g. UAE Dirham"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newRate">Exchange Rate (KWD per 1 unit)</Label>
              <Input
                id="newRate"
                type="number"
                step="0.0001"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Base currency is KWD (always 1.0000). Example: if 1 USD = 0.31 KWD, enter 0.31.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
