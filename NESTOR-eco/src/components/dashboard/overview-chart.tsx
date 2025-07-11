"use client"

import { Bar, BarChart } from "recharts"
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
    color: "hsl(var(--primary))",
  },
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                    formatter={(value) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    labelClassName="font-bold"
                />
              }
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
