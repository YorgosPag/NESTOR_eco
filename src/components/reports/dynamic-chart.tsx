"use client"

import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"
import type { ChartData } from "@/ai/flows/schemas";
import { useTheme } from "next-themes";

interface DynamicChartProps {
  chartData: ChartData;
}

const COLORS = ["#2563eb", "#f97316", "#22c55e", "#ef4444", "#8b5cf6", "#fde047"];

export function DynamicChart({ chartData }: DynamicChartProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const chartConfig = chartData.data.reduce((acc, item, index) => {
    const sanitizedKey = item.name.replace(/[^a-zA-Z0-9]/g, '') || `item${index}`;
    acc[sanitizedKey] = {
      label: item.name,
      color: COLORS[index % COLORS.length]
    };
    return acc;
  }, {} as ChartConfig);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartData.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          {chartData.type === 'bar' ? (
            <BarChart accessibilityLayer data={chartData.data}>
                <XAxis dataKey="name" stroke={isDarkMode ? "#a1a1aa" : "#71717a"} fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke={isDarkMode ? "#a1a1aa" : "#71717a"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={chartData.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                 {chartData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
