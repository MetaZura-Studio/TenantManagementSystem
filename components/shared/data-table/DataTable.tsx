"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  search?: {
    columnId: string
    placeholder?: string
  }
  sort?: {
    options: Array<{ label: string; columnId: string }>
    defaultColumnId?: string
    defaultDirection?: "asc" | "desc"
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  sort,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Ensure default sort is applied once if provided.
  React.useEffect(() => {
    if (!sort?.defaultColumnId) return
    const hasSort = table.getState().sorting.length > 0
    if (!hasSort) {
      table.setSorting([
        {
          id: sort.defaultColumnId,
          desc: (sort.defaultDirection ?? "asc") === "desc",
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort?.defaultColumnId, sort?.defaultDirection])

  const searchCol = search?.columnId ? table.getColumn(search.columnId) : undefined
  const searchValue = (searchCol?.getFilterValue() as string) ?? ""

  const sortOptions = sort?.options ?? []
  const currentSort = table.getState().sorting[0]
  const sortColumnId =
    currentSort?.id ??
    sort?.defaultColumnId ??
    (sortOptions.length ? sortOptions[0]!.columnId : "")
  const activeCol = sortColumnId ? table.getColumn(sortColumnId) : undefined
  const activeColState = activeCol?.getIsSorted() // "asc" | "desc" | false
  const sortIsDesc =
    activeColState === "desc"
      ? true
      : activeColState === "asc"
      ? false
      : !!currentSort?.desc

  return (
    <div className="space-y-4">
      {(searchCol || sortOptions.length > 0) ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 pt-4">
          <div className="flex flex-1 items-center gap-3">
            {searchCol ? (
              <div className="w-full sm:max-w-md">
                <Input
                  placeholder={search?.placeholder ?? "Search..."}
                  value={searchValue}
                  onChange={(e) => searchCol.setFilterValue(e.target.value)}
                />
              </div>
            ) : null}
            {searchCol && searchValue ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => searchCol.setFilterValue("")}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {sortOptions.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground hidden sm:block">Sort by</div>
              <Select
                value={sortColumnId}
                onValueChange={(value) => {
                  // Preserve current global direction when changing the sort column.
                  const globalDesc = !!table.getState().sorting[0]?.desc
                  table.setSorting([{ id: value, desc: globalDesc }])
                }}
              >
                <SelectTrigger className="h-10 w-[220px] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.columnId} value={o.columnId}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() => {
                  if (!sortColumnId) return
                  const cur = table.getState().sorting[0]
                  const curDesc = cur?.id === sortColumnId ? !!cur.desc : false
                  table.setSorting([{ id: sortColumnId, desc: !curDesc }])
                }}
                title={sortIsDesc ? "Descending" : "Ascending"}
              >
                {sortIsDesc ? (
                  <ArrowDown className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-2" />
                )}
                {sortIsDesc ? "Z–A" : "A–Z"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                            className={cn(
                              "inline-flex items-center gap-2 text-left",
                              header.column.getCanSort() && "hover:text-foreground transition-colors"
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() ? (
                              header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : null
                            ) : null}
                          </button>
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground px-3">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
