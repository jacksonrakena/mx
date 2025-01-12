"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { useAppSession } from "@/app/providers/AppSessionProvider";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CircleDollarSign, Landmark } from "lucide-react";
import { useMemo } from "react";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  assets: {
    label: "Assets",
    icon: Landmark,
    color: "#2563eb",
  },
  liabilities: {
    label: "Liabilities",
    icon: CircleDollarSign,
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export const AssetChart = ({
  data,
  lines,
}: {
  data: any;
  lines: {
    color: string;
    key: string;
  }[];
}) => {
  const appSession = useAppSession();
  if (!appSession.user) return <></>;
  const currencyFormatter = useMemo(
    () => appSession.currencyFormatFactory(appSession.user.homeCurrency),
    [appSession, appSession.user]
  );
  const dateFormatter = new Intl.DateTimeFormat([], {
    month: "long",
    year: "numeric",
  });
  const monthTickFormatter = new Intl.DateTimeFormat([], {
    month: "short",
    year: "2-digit",
  });
  return (
    <ChartContainer
      config={Object.fromEntries(
        lines.map((line) => [
          line.key,
          {
            label: line.key,
          },
        ])
      )}
      className="min-h-[200px] w-full"
    >
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickFormatter={(value) => {
            console.log(value);
            console.log(new Date(value));
            return monthTickFormatter.format(new Date(value));
          }}
        />
        <YAxis />
        <ChartLegend content={<ChartLegendContent />} />

        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => {
                return <>{dateFormatter.format(new Date(label))}</>;
              }}
              formatter={(value, name) => (
                <div className="w-full flex justify-between text-xs text-muted-foreground">
                  <div className="max-w-52">
                    {chartConfig[name as keyof typeof chartConfig]?.label ||
                      name}
                  </div>
                  <div className="font-mono font-medium tabular-nums text-foreground">
                    ${currencyFormatter.format(value as number)}
                  </div>
                </div>
              )}
            />
          }
        />

        {lines.map((line) => (
          <Line
            connectNulls
            key={line.key}
            strokeWidth={2}
            type="monotone"
            stroke={line.color}
            dataKey={line.key}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
