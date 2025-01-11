import { auth } from "@/auth";
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
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { conversionFactors } from "./balance-sheet/assets/layout";
import { Charts } from "./balance-sheet/components/Charts";

const prisma = new PrismaClient();
const calculateBaseValue = (asset: {
  entries: { currencyCode: string; totalValue: Decimal }[];
}) => {
  if (asset.entries.length === 0) return 0;
  return asset.entries[0].currencyCode === "NZD"
    ? asset.entries[0].totalValue.toNumber()
    : asset.entries[0].totalValue.toNumber() *
        conversionFactors[asset.entries[0].currencyCode];
};
const MulticurrencyValue = ({
  asset,
}: {
  asset: {
    entries: { currencyCode: string; totalValue: Decimal }[];
  };
}) => {
  return (
    <div className="flex flex-col">
      <div>
        NZD$
        {calculateBaseValue(asset).toLocaleString([], {
          maximumFractionDigits: 2,
        })}
      </div>
      {asset.entries.length !== 0 &&
        asset.entries[0].currencyCode !== "NZD" && (
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
  const session = await auth();
  if (!session?.user?.email) return <>Login</>;

  const joined = await prisma.object.findMany({
    where: {
      owner: session?.user?.email,
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
          ? b.entries[0].currencyCode === "NZD"
            ? b.entries[0].totalValue.toNumber()
            : b.entries[0].totalValue.toNumber() *
              conversionFactors[b.entries[0].currencyCode]
          : 0
        : (b.entries[0]
            ? b.entries[0].currencyCode === "NZD"
              ? b.entries[0].totalValue.toNumber()
              : b.entries[0].totalValue.toNumber() *
                conversionFactors[b.entries[0].currencyCode]
            : 0) * -1)
    );
  }, 0);
  const assets = joined.filter((e) => e.type === "ASSET");
  const assetWorth = assets.reduce((a, b) => {
    if (b.entries.length === 0) return a;
    return (
      a +
      (b.entries[0]
        ? b.entries[0].currencyCode === "NZD"
          ? b.entries[0].totalValue.toNumber()
          : b.entries[0].totalValue.toNumber() *
            conversionFactors[b.entries[0].currencyCode]
        : 0)
    );
  }, 0);
  const liabilities = joined.filter((e) => e.type === "LIABILITY");
  const liaWorth = liabilities.reduce((a, b) => {
    if (b.entries.length === 0) return a;
    return (
      a +
      (b.entries[0]
        ? b.entries[0].currencyCode === "NZD"
          ? b.entries[0].totalValue.toNumber()
          : b.entries[0].totalValue.toNumber() *
            conversionFactors[b.entries[0].currencyCode]
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
              NZD${netWorth.toLocaleString([], { maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm">
              Net worth &bull; {assets.length} assets &bull;{" "}
              {liabilities.length} liabilities
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-6">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Total assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div>
                <div className="text-2xl font-extrabold">
                  NZD$
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
                              calculateBaseValue(a) - calculateBaseValue(b)
                          )
                          .slice(0, 5)
                          .map((a) => (
                            <TableRow key={a.id}>
                              <TableCell>{a.name}</TableCell>
                              <TableCell>
                                <MulticurrencyValue asset={a} />
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
                  NZD$
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
                              calculateBaseValue(a) - calculateBaseValue(b)
                          )
                          .slice(0, 5)
                          .map((a) => (
                            <TableRow>
                              <TableCell>{a.name}</TableCell>
                              <TableCell>
                                <MulticurrencyValue asset={a} />
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
