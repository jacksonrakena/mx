"use client";
import {
  AuthenticatedAppSession,
  useAppSession,
} from "@/app/providers/AppSessionProvider";
import {
  CustomTable,
  DataTablePagination,
} from "@/components/custom/CustomTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Decimal } from "decimal.js";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { deleteAsset } from "../actions";

type EntryRow = {
  id: string;
  name: string;
  type: string;
  unitsHeld?: string;
  unitValue?: string;
  totalValue?: string;
  totalValueBaseCurrency?: string;
  totalValueBaseCurrencySortable: number;
  currencyCode?: string;
  lastEntryDate?: Date;
};

const createColumns = (
  session: AuthenticatedAppSession
): ColumnDef<EntryRow>[] => {
  const homeCurrency = session.user.homeCurrency;
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ renderValue }) => (
        <span className="font-medium">{renderValue<any>()}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link href={`/assets/${row.original.id}`}>{row.original.name}</Link>
      ),
    },
    {
      accessorKey: "unitsHeld",
      header: "Units held",
      cell: ({ row }) => {
        const value = row.getValue<string>("unitsHeld");
        if (value) return new Decimal(value).toNumber();
        return "";
      },
    },
    {
      accessorKey: "unitValue",
      header: "Unit value",
      cell: ({ row }) => {
        if (!row.original.unitValue || !row.original.currencyCode) return "";
        return new Intl.NumberFormat([], {
          style: "currency",
          currency: row.original.currencyCode as any,
        }).format(new Decimal(row.original.unitValue).toNumber());
      },
    },
    {
      accessorKey: "totalValue",
      header: "Total value",
      cell: ({ row, cell }) => {
        if (
          !cell.row.original.totalValue ||
          !cell.row.original.totalValueBaseCurrency
        )
          return "";
        const currencyCode = cell.row.original.currencyCode as string;
        const formatter = new Intl.NumberFormat([], {
          style: "currency",
          currency: homeCurrency,
        });
        const baseValue =
          currencyCode === homeCurrency
            ? formatter.format(
                new Decimal(row.getValue<string>("totalValue")).toNumber()
              )
            : formatter.format(
                new Decimal(cell.row.original.totalValueBaseCurrency).toNumber()
              );
        const formatted = new Intl.NumberFormat([], {
          style: "currency",
          currency: currencyCode,
        }).format(new Decimal(row.getValue<string>("totalValue")).toNumber());
        return (
          <>
            {currencyCode !== homeCurrency ? (
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
      accessorKey: "lastEntryDate",
      header: "Last valued",
      cell: ({ row }) => {
        const value = row.getValue<Date>("lastEntryDate");
        return value?.toLocaleDateString();
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
                Copy asset ID
              </DropdownMenuItem>
              <DropdownMenuItem></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  (async () => {
                    await deleteAsset(row.original.id);
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
};

export const AssetTable = ({ data }: { data: EntryRow[] }) => {
  const appSession = useAppSession();
  if (!appSession.user) return <></>;
  const columns = useMemo(() => createColumns(appSession), [appSession]);
  const table = useReactTable({
    columns: columns,
    data: data.toSorted((a, b) =>
      new Decimal(b.totalValueBaseCurrency ?? 0)
        .sub(a.totalValueBaseCurrency ?? 0)
        .toNumber()
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageSize(5);
  }, []);
  return (
    <>
      <CustomTable table={table} columns={columns}>
        {table.getRowCount() !== 0 && <DataTablePagination table={table} />}
      </CustomTable>
    </>
  );
};
