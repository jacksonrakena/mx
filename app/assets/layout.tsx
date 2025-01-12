import { Currency, Prisma, PrismaClient } from "@prisma/client";
import { calculateBaseValue } from "../page";
import { authenticate } from "../users";
import { AssetChart } from "./_components/AssetChart";
import { AssetTable } from "./_components/AssetTable";
import { CreateAsset } from "./_components/CreateAsset";

const prisma = new PrismaClient();

export type ObjectWithLatestEntry = {
  object: Prisma.ObjectGetPayload<{}>;
  entry: Prisma.EntryGetPayload<{}>;
};

type ConversionsTo<HomeCurrency extends string> = Record<HomeCurrency, 1> & {
  [key in Currency]: number;
};
type ConversionFactorTable = {
  [key in Currency]: ConversionsTo<key>;
};
export const conversionFactors: ConversionFactorTable = {
  NZD: {
    AUD: 0.9,
    USD: 0.56,
    HKD: 4.35,
    NZD: 1.0,
  },
  USD: {
    NZD: 1.8,
    HKD: 7.79,
    AUD: 1.63,
    USD: 1.0,
  },
  AUD: {
    NZD: 1.11,
    HKD: 4.79,
    USD: 0.61,
    AUD: 1.0,
  },
  HKD: {
    USD: 0.13,
    NZD: 0.23,
    AUD: 0.21,
    HKD: 1.0,
  },
};
export default async function Assets({
  children,
}: React.PropsWithChildren<{}>) {
  const session = await authenticate();
  if (!session.user) return <></>;

  const objects = await prisma.object.findMany({
    where: {
      ownerId: session.user.id ?? "",
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
        ownerId: session.user.id ?? "",
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
      <AssetTable
        data={joined.map((row) => ({
          id: row.object.id,
          currencyCode: row.entry?.currencyCode,
          lastEntryDate: row.entry?.createdAt,
          name: row.object.name,
          totalValue: row.entry?.totalValue.toString(),
          totalValueBaseCurrency: row.entry
            ? calculateBaseValue(
                {
                  ...row,
                  entries: [row.entry!],
                },
                session.user.homeCurrency
              ).toString()
            : "0",
          type: row.object.type,
          unitsHeld: row.entry?.unitCount.toString(),
          unitValue: row.entry?.unitValue.toString(),
          totalValueBaseCurrencySortable: row.entry
            ? calculateBaseValue(
                {
                  ...row,
                  entries: [row.entry!],
                },
                session.user.homeCurrency
              )
            : 0,
        }))}
      />
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
