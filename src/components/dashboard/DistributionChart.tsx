import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DistributionChart({ data = [] }: { data?: { orgao: string; value: number }[] }) {
  const totalInstallments = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="flex flex-col h-full shadow-sm rounded-xl">
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-base font-semibold text-slate-800">
          Distribuição por Órgão
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Totalizadores de processos por organização
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-sm text-slate-500">Sem dados para exibir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.orgao || 'Não especificado'}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-white font-semibold text-slate-700 border-slate-200 shadow-sm"
                  >
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-slate-800">Total de Processos</span>
              <span className="text-lg font-bold text-slate-900">{totalInstallments}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
