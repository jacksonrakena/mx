"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table";
import { Decimal } from "decimal.js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { conversionFactors } from "../../layout";
import { deleteLedgerEntry } from "../actions";
import { CreateEntry } from "./CreateEntry";

export type EntryRow = {
  id: string;
  objectId: string;
  dateHeld: Date;
  unitsHeld: Decimal;
  unitValue: Decimal;
  totalValue: Decimal;
  totalValueBaseCurrency: Decimal;
  currencyCode: String;
};

export const columns: ColumnDef<EntryRow>[] = [
  {
    accessorKey: "dateHeld",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue<Date>("dateHeld");
      return value.toLocaleDateString();
    },
  },
  {
    accessorKey: "unitsHeld",
    header: "Units held",
    cell: ({ row }) => row.getValue<Decimal>("unitsHeld").toNumber(),
  },
  {
    accessorKey: "unitValue",
    header: "Unit value",
  },
  {
    accessorKey: "totalValue",
    header: "Total value",
    cell: ({ row, cell }) => {
      const currencyCode = cell.row.original.currencyCode as string;
      const formatter = new Intl.NumberFormat("en-NZ", {
        style: "currency",
        currency: "NZD",
      });
      const baseValue =
        currencyCode === "NZD"
          ? formatter.format(
              new Decimal(row.getValue<string>("totalValue")).toNumber()
            )
          : formatter.format(
              cell.row.original.totalValueBaseCurrency.toNumber()
            );
      const formatted = new Intl.NumberFormat("en-NZ", {
        style: "currency",
        currency: currencyCode,
      }).format(new Decimal(row.getValue<string>("totalValue")).toNumber());
      return (
        <>
          {currencyCode !== "NZD" ? (
            <>
              <div className="flex flex-col">
                <span>{baseValue}</span>
                <span className="text-xs text-gray-500">{formatted}</span>
              </div>
            </>
          ) : (
            <>{baseValue}</>
          )}
        </>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entry = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(entry.id)}
            >
              Copy valuation ID
            </DropdownMenuItem>
            <DropdownMenuItem></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                (async () => {
                  await deleteLedgerEntry(
                    row.original.objectId,
                    row.original.id
                  );
                })();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const AssetInfo = ({
  asset,
}: {
  asset: Prisma.ObjectGetPayload<{ include: { entries: true } }>;
}) => {
  const router = useRouter();
  const table = useReactTable({
    columns: columns,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: [{ id: "dateHeld", desc: true }],
    },
    data: asset.entries.map(
      (entry) =>
        ({
          currencyCode: entry.currencyCode,
          dateHeld: entry.createdAt,
          id: entry.id,
          objectId: entry.objectId,
          totalValue: new Decimal(entry.totalValue),
          totalValueBaseCurrency:
            entry.currencyCode === "NZD"
              ? new Decimal(0)
              : new Decimal(entry.totalValue).mul(
                  conversionFactors[entry.currencyCode]
                ),
          unitsHeld: new Decimal(entry.unitCount),
          unitValue: new Decimal(entry.unitValue),
        } as EntryRow)
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <Dialog
        open={true}
        onOpenChange={() => {
          router.push(`/assets`);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{asset?.name}</DialogTitle>
            <DialogDescription>
              <div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            );
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
                {table.getRowCount() !== 0 && (
                  <DataTablePagination table={table} />
                )}
              </div>
            </DialogDescription>
            <CreateEntry assetId={asset.id} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      {/* <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
      <div className="flex items-center">
        {/* <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
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
        </div> */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
