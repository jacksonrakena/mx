import { auth } from "@/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { AssetChart } from "./_components/AssetChart";
import { CreateAsset } from "./_components/CreateAsset";

const prisma = new PrismaClient();

export type ObjectWithLatestEntry = {
  object: Prisma.ObjectGetPayload<{}>;
  entry: Prisma.EntryGetPayload<{}>;
};

export const conversionFactors: { [x: string]: number } = {
  USD: 1.8,
  AUD: 1.11,
  HKD: 0.23,
};
export default async function Assets({
  children,
}: React.PropsWithChildren<{}>) {
  const session = await auth();
  const objects = await prisma.object.findMany({
    where: {
      owner: session?.user?.email ?? "",
    },
  });
  const entries = await prisma.entry.findMany({
    where: {
      objectId: {
        in: objects.map((e) => e.id),
      },
    },
    orderBy: { createdAt: "desc" },
    distinct: "objectId",
  });
  const joined = objects.map((obj) => ({
    object: obj,
    entry: entries.find((a) => a.objectId == obj.id),
  }));
  const allEntries = await prisma.entry.findMany({
    where: {
      object: {
        owner: session?.user?.email ?? "",
      },
    },
    include: { object: { select: { name: true } } },
  });
  const monthBins: { [x: string]: typeof allEntries } = {};
  for (const entry of allEntries) {
    const month = entry.createdAt.getMonth() + 1;
    const year = entry.createdAt.getFullYear();
    const day = entry.createdAt.getDay() + 1;
    const bin = `${year}-${month}`;
    monthBins[bin] = [...(monthBins[bin] ?? []), entry];
  }
  const data = Object.entries(monthBins)
    .map(([time, entries]) => {
      const ent: any = {
        name: time,
      };
      for (const entry of entries) {
        ent[entry.object.name] = entry.totalValue.toNumber();
      }
      return ent;
    })
    .toSorted((a, b) => Date.parse(a.name) - Date.parse(b.name));
  return (
    <>
      <div className="text-xl font-bold">Your assets</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Unit value</TableHead>
            <TableHead>Total value</TableHead>
            <TableHead>Last valued</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {joined.map((row) => (
            <TableRow key={row.object.id}>
              <TableCell className="font-medium">{row.object.type}</TableCell>
              <TableCell>
                <Link href={`/assets/${row.object.id}`}>{row.object.name}</Link>
              </TableCell>
              {row.entry ? (
                <>
                  {" "}
                  <TableCell>{row.entry?.unitCount.toString()}</TableCell>
                  <TableCell>
                    {row.entry?.currencyCode}$
                    {row.entry?.unitValue.toNumber().toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {row.entry.currencyCode !== "NZD" ? (
                      <>
                        <div className="flex flex-col">
                          <span>
                            NZD$
                            {(
                              row.entry?.totalValue.toNumber() *
                              conversionFactors[row.entry?.currencyCode]
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {row.entry?.currencyCode}$
                            {row.entry?.totalValue.toNumber().toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {row.entry?.currencyCode}$
                        {row.entry?.totalValue.toNumber().toLocaleString()}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.entry?.updatedAt.toLocaleDateString()}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell colSpan={4}>
                    <div className="text-center text-secondary-foreground">
                      No data
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold">Net worth</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>
              NZD$
              {joined
                .map((e) =>
                  e.object.type === "ASSET"
                    ? e.entry
                      ? e.entry?.currencyCode === "NZD"
                        ? e.entry.totalValue.toNumber()
                        : e.entry?.totalValue.toNumber() *
                          conversionFactors[e.entry?.currencyCode]
                      : 0
                    : (e.entry
                        ? e.entry?.currencyCode === "NZD"
                          ? e.entry.totalValue.toNumber()
                          : e.entry?.totalValue.toNumber() *
                            conversionFactors[e.entry?.currencyCode]
                        : 0) * -1
                )
                .reduce((a, b) => a + b, 0)
                .toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="max-w-3xl">
        <AssetChart
          lines={objects.map((e) => ({ color: "green", key: e.name }))}
          data={data}
        />
      </div>
      {children}
      <CreateAsset />
    </>
  );
}
