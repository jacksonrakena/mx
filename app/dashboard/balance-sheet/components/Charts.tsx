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

const data = [
  {
    name: "Jan 25",
    assets: 45000,
    liabilities: 22000,
  },

  {
    name: "Feb 25",
    assets: 47000,
    liabilities: 22000,
  },
  {
    name: "Mar 25",
    assets: 49000,
    liabilities: 22000,
  },
  {
    name: "Apr 25",
    assets: 51000,
    liabilities: 22000,
  },
  {
    name: "May 25",
    assets: 50000,
    liabilities: 22000,
  },
];
export const Charts = async () => {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <ChartLegend content={<ChartLegendContent />} />

        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" stroke="green" dataKey="assets" />
        <Line type="monotone" stroke="blue" dataKey="liabilities" />
      </LineChart>
    </ChartContainer>
  );
};
