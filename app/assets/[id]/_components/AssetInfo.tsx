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
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Decimal } from "decimal.js";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { ConversionFactorTable } from "../../page";
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
  currencyCode: string;
};

export const createColumns = (
  session: AuthenticatedAppSession
): ColumnDef<EntryRow>[] => {
  const homeCurrency = session.user.homeCurrency;
  return [
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
                cell.row.original.totalValueBaseCurrency.toNumber()
              );
        const formatted = new Intl.NumberFormat("en-NZ", {
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
};

export const AssetInfo = ({
  asset,
  conversionFactors,
}: {
  asset: Prisma.ObjectGetPayload<{ include: { entries: true } }>;
  conversionFactors: ConversionFactorTable;
}) => {
  const appSession = useAppSession() as AuthenticatedAppSession;
  const columns = useMemo(() => createColumns(appSession), [appSession]);
  const entries = useMemo(
    () =>
      asset.entries.map(
        (entry) =>
          ({
            currencyCode: entry.currencyCode,
            dateHeld: entry.createdAt,
            id: entry.id,
            objectId: entry.objectId,
            totalValue: new Decimal(entry.totalValue),
            totalValueBaseCurrency:
              entry.currencyCode === appSession.user.homeCurrency
                ? new Decimal(0)
                : new Decimal(entry.totalValue).mul(
                    conversionFactors[entry.currencyCode][
                      appSession.user.homeCurrency
                    ]
                  ),
            unitsHeld: new Decimal(entry.unitCount),
            unitValue: new Decimal(entry.unitValue),
          } as EntryRow)
      ),
    [asset.entries, appSession.user.homeCurrency]
  );
  const table = useReactTable({
    columns: columns,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "dateHeld", desc: true }],
    },
    data: entries,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <div className="text-2xl font-bold">{asset?.name}</div>
      <div>
        <div className="text-xl font-semibold mb-2">Asset history</div>
        <CustomTable table={table} columns={columns}>
          {table.getRowCount() !== 0 && <DataTablePagination table={table} />}
        </CustomTable>
        <CreateEntry assetId={asset.id} />
      </div>
    </>
  );
};
