"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CircleDollarSign, Landmark } from "lucide-react";

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
        <XAxis dataKey="name" />
        <YAxis />
        <ChartLegend content={<ChartLegendContent />} />

        <ChartTooltip content={<ChartTooltipContent />} />

        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            stroke={line.color}
            dataKey={line.key}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
