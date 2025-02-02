import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  ConversionFactorTable,
  requestConversionFactorsTable,
} from "./assets/page";
import { Charts } from "./components/Charts";
import { authenticate } from "./users";

const prisma = new PrismaClient();
export const calculateEntryBaseValue = (
  currencyCode: Currency,
  totalValue: Decimal,
  homeCurrency: Currency,
  conversionFactors: ConversionFactorTable
) => {
  return currencyCode === homeCurrency
    ? totalValue.toNumber()
    : totalValue.toNumber() * conversionFactors[currencyCode][homeCurrency];
};
export const calculateBaseValue = (
  asset: {
    entries: { currencyCode: Currency; totalValue: Decimal }[];
  },
  homeCurrency: Currency,
  conversionFactors: ConversionFactorTable
) => {
  if (asset.entries.length === 0) return 0;
  return calculateEntryBaseValue(
    asset.entries[0].currencyCode,
    asset.entries[0].totalValue,
    homeCurrency,
    conversionFactors
  );
};
const MulticurrencyValue = ({
  asset,
  homeCurrency,
  conversionFactors,
}: {
  asset: {
    entries: { currencyCode: Currency; totalValue: Decimal }[];
  };
  homeCurrency: Currency;
  conversionFactors: ConversionFactorTable;
}) => {
  return (
    <div className="flex flex-col">
      <div>
        {homeCurrency}$
        {calculateBaseValue(
          asset,
          homeCurrency,
          conversionFactors
        ).toLocaleString([], {
          maximumFractionDigits: 2,
        })}
      </div>
      {asset.entries.length !== 0 &&
        asset.entries[0].currencyCode !== homeCurrency && (
          <div className="text-xs text-gray-500">
            {asset.entries[0].currencyCode}$
            {asset.entries[0].totalValue
              .toNumber()
              .toLocaleString([], { maximumFractionDigits: 2 })}
          </div>
        )}
    </div>
  );
};
export default async function Overview() {
  const session = await authenticate();
  if (!session.user) return <></>;
  const conversionFactors = await requestConversionFactorsTable();

  const joined = await prisma.object.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      entries: {
        select: { totalValue: true, currencyCode: true },
        orderBy: { createdAt: "desc" },
        distinct: "objectId",
      },
    },
  });
  const netWorth = joined.reduce((a, b) => {
    if (b.entries.length === 0) return a;
    return (
      a +
      (b.type === "ASSET"
        ? b.entries[0]
          ? b.entries[0].currencyCode === session.user.homeCurrency
            ? b.entries[0].totalValue.toNumber()
            : b.entries[0].totalValue.toNumber() *
              conversionFactors[b.entries[0].currencyCode][
                session.user.homeCurrency
              ]
          : 0
        : (b.entries[0]
            ? b.entries[0].currencyCode === session.user.homeCurrency
              ? b.entries[0].totalValue.toNumber()
              : b.entries[0].totalValue.toNumber() *
                conversionFactors[b.entries[0].currencyCode][
                  session.user.homeCurrency
                ]
            : 0) * -1)
    );
  }, 0);
  const assets = joined.filter((e) => e.type === "ASSET");
  const assetWorth = assets.reduce((a, b) => {
    if (b.entries.length === 0) return a;
    return (
      a +
      (b.entries[0]
        ? b.entries[0].currencyCode === session.user.homeCurrency
          ? b.entries[0].totalValue.toNumber()
          : b.entries[0].totalValue.toNumber() *
            conversionFactors[b.entries[0].currencyCode][
              session.user.homeCurrency
            ]
        : 0)
    );
  }, 0);
  const liabilities = joined.filter((e) => e.type === "LIABILITY");
  const liaWorth = liabilities.reduce((a, b) => {
    if (b.entries.length === 0) return a;
    return (
      a +
      (b.entries[0]
        ? b.entries[0].currencyCode === session.user.homeCurrency
          ? b.entries[0].totalValue.toNumber()
          : b.entries[0].totalValue.toNumber() *
            conversionFactors[b.entries[0].currencyCode][
              session.user.homeCurrency
            ]
        : 0) *
        -1
    );
  }, 0);
  return (
    <>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-2 mt-6">
            <div className="text-lg">Welcome back, Jackson</div>
            <div className="text-xl font-bold">
              {session.user.homeCurrency}$
              {netWorth.toLocaleString([], { maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm">
              Net worth &bull; {assets.length} assets &bull;{" "}
              {liabilities.length} liabilities
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Total assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div>
                <div className="text-2xl font-extrabold">
                  {session.user.homeCurrency}$
                  {assetWorth.toLocaleString([], { maximumFractionDigits: 2 })}
                </div>
                <div className="text-gray-600 text-sm">
                  +21.5% from May 2020
                </div>

                <div className="mt-8">
                  <div className="text-lg font-bold">Top assets</div>
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assets
                          .toSorted(
                            (b, a) =>
                              calculateBaseValue(
                                a,
                                session.user.homeCurrency,
                                conversionFactors
                              ) -
                              calculateBaseValue(
                                b,
                                session.user.homeCurrency,
                                conversionFactors
                              )
                          )
                          .slice(0, 5)
                          .map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="text-wrap">
                                {a.name}
                              </TableCell>
                              <TableCell>
                                <MulticurrencyValue
                                  asset={a}
                                  homeCurrency={session.user.homeCurrency}
                                  conversionFactors={conversionFactors}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Total liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div>
                <div className="text-2xl font-extrabold">
                  {session.user.homeCurrency}$
                  {(liaWorth * -1).toLocaleString([], {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-gray-600 text-sm">
                  +21.5% from May 2020
                </div>

                <div className="mt-8">
                  <div className="text-lg font-bold">Top liabilities</div>
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {liabilities
                          .toSorted(
                            (b, a) =>
                              calculateBaseValue(
                                a,
                                session.user.homeCurrency,
                                conversionFactors
                              ) -
                              calculateBaseValue(
                                b,
                                session.user.homeCurrency,
                                conversionFactors
                              )
                          )
                          .slice(0, 5)
                          .map((a) => (
                            <TableRow key={a.id}>
                              <TableCell>{a.name}</TableCell>
                              <TableCell>
                                <MulticurrencyValue
                                  asset={a}
                                  homeCurrency={session.user.homeCurrency}
                                  conversionFactors={conversionFactors}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Charts />
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </>
  );
}
