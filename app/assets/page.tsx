/* eslint-disable @typescript-eslint/no-explicit-any */
import { Currency, Prisma, PrismaClient } from "@prisma/client";
import { add, format, isBefore } from "date-fns";
import { calculateBaseValue, calculateEntryBaseValue } from "../page";
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
export type ConversionFactorTable = {
  [key in Currency]: ConversionsTo<key>;
};
export const requestConversionFactorsTable =
  async (): Promise<ConversionFactorTable> => {
    const data = await fetch(process.env.MIXER_API_HOST + "/currency/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instruments: Object.values(Currency)
          .map((currency) =>
            Object.values(Currency)
              .filter((e) => e != currency)
              .map((e) => [currency, e])
          )
          .flat()
          .map((r) => ({ base: r[0], target: r[1] })),
      }),
    }).then((d) => d.json());
    const allDates = Object.keys(data.rates);
    if (allDates.length === 0) return {} as any;
    const response = data.rates[allDates[allDates.length - 20]];
    console.log(response);
    return response;
  };
export default async function Assets() {
  const session = await authenticate();
  if (!session.user) return <></>;

  const conversionFactors = await requestConversionFactorsTable();
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
  let data = [];
  if (allEntries.length > 0) {
    const sortedEntries = allEntries.toSorted(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const earliestEntry = sortedEntries[0];
    const latestEntry = sortedEntries[sortedEntries.length - 1];
    const monthRanges = [];
    let currentDate = earliestEntry.createdAt;
    while (isBefore(currentDate, latestEntry.createdAt)) {
      monthRanges.push(currentDate);
      currentDate = add(currentDate, { months: 1 });
    }
    const monthBins = Object.fromEntries(
      monthRanges.map((e) => [format(e, "yyyy-MM"), [] as any[]])
    );
    for (const entry of allEntries) {
      const bin = format(entry.createdAt, "yyyy-MM");
      monthBins[bin] = [...(monthBins[bin] ?? []), entry];
    }
    data = Object.entries(monthBins)
      .map(([time, entries]) => {
        const ent: any = {
          name: time,
        };
        for (const entry of entries) {
          ent[entry.object.name] = calculateEntryBaseValue(
            entry.currencyCode,
            entry.totalValue,
            session.user.homeCurrency,
            conversionFactors
          );
        }
        return ent;
      })
      .toSorted((a, b) => Date.parse(a.name) - Date.parse(b.name));
  }

  return (
    <>
      <div className="text-xl font-bold">Your assets</div>
      <div className="max-w-3xl">
        <AssetChart
          lines={objects.map((e, i) => ({
            color:
              i < colorScheme.length ? colorScheme[i] : stringToColor(e.name),
            key: e.name,
          }))}
          data={data}
        />
      </div>
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
                session.user.homeCurrency,
                conversionFactors
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
                session.user.homeCurrency,
                conversionFactors
              )
            : 0,
        }))}
      />

      <CreateAsset />
    </>
  );
}

const colorScheme = [
  "#25CCF7",
  "#FD7272",
  "#54a0ff",
  "#00d2d3",
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#ecf0f1",
  "#95a5a6",
  "#f39c12",
  "#d35400",
  "#c0392b",
  "#bdc3c7",
  "#7f8c8d",
  "#55efc4",
  "#81ecec",
  "#74b9ff",
  "#a29bfe",
  "#dfe6e9",
  "#00b894",
  "#00cec9",
  "#0984e3",
  "#6c5ce7",
  "#ffeaa7",
  "#fab1a0",
  "#ff7675",
  "#fd79a8",
  "#fdcb6e",
  "#e17055",
  "#d63031",
  "#feca57",
  "#5f27cd",
  "#54a0ff",
  "#01a3a4",
];
const stringToColor = (string: string, saturation = 100, lightness = 50) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
};
