
"use client"

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart"

interface OverviewChartProps {
  data: { name: string; total: number }[];
}

const chartConfig = {
  total: {
    label: "Προϋπολογισμός",
  },
  'Εντός': {
    label: "Εντός",
    color: "hsl(var(--chart-1))",
  },
  'Καθυστέρηση': {
    label: "Καθυστέρηση",
    color: "hsl(var(--chart-2))",
  },
  'Ολοκληρωμένα': {
      label: "Ολοκληρωμένα",
      color: "hsl(var(--chart-3))",
  }
} satisfies ChartConfig

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Επισκόπηση Προϋπολογισμού</CardTitle>
        <CardDescription>
          Συνολικός προϋπολογισμός ανά κατάσταση έργου.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${new Intl.NumberFormat('el-GR').format(value as number)}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                    formatter={(value) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    labelClassName="font-bold"
                />
              }
            />
            <Bar dataKey="total" radius={4}>
                {data.map((entry) => {
                    const key = entry.name as keyof typeof chartConfig;
                    const color = (chartConfig[key] && chartConfig[key].color) || 'hsl(var(--primary))';
                    return <Cell key={entry.name} fill={color} />
                })}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
