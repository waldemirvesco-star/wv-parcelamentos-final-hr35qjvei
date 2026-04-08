import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, Label } from 'recharts'

const chartConfig = {
  'Receita Federal': { label: 'Receita Federal', color: 'hsl(var(--chart-1))' },
  'Estado SP': { label: 'Estado SP', color: 'hsl(var(--chart-2))' },
  Prefeitura: { label: 'Prefeitura', color: 'hsl(var(--chart-3))' },
  PGFN: { label: 'PGFN', color: 'hsl(var(--chart-4))' },
  'Secretaria da Fazenda': { label: 'Sec. da Fazenda', color: 'hsl(var(--chart-5))' },
  Outros: { label: 'Outros', color: 'hsl(var(--chart-1))' },
}

export function DistributionChart({ data = [] }: { data?: { orgao: string; value: number }[] }) {
  const dataWithColors = data.map((d) => ({
    ...d,
    fill: chartConfig[d.orgao as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))',
  }))

  const totalInstallments = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="flex flex-col h-full shadow-sm rounded-xl">
      <CardHeader className="items-center pb-0 pt-4 text-center">
        <CardTitle className="text-base text-slate-800">Distribuição por Órgão</CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Totalizadores por organização
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col items-center justify-center min-h-[250px]">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Sem dados para exibir.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={dataWithColors}
                dataKey="value"
                nameKey="orgao"
                innerRadius={65}
                strokeWidth={2}
                paddingAngle={2}
                label={({ value }) => value}
                labelLine={false}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-slate-800 text-3xl font-bold"
                          >
                            {totalInstallments.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-slate-500 text-xs"
                          >
                            Processos
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
                {dataWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                className="mt-4 text-xs flex-wrap justify-center gap-2"
                content={<ChartLegendContent />}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
