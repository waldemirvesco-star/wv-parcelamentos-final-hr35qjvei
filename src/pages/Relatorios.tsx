import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, BarChart2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Relatorios() {
  const { toast } = useToast()

  const handleGenerateReport = () => {
    toast({
      title: 'Gerando relatório',
      description: 'O relatório está sendo processado e será baixado em breve.',
    })

    setTimeout(() => {
      toast({
        title: 'Relatório Concluído',
        description: 'Download iniciado com sucesso.',
      })
    }, 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios</h2>
        <p className="text-slate-500 mt-1">Gere e faça download de relatórios gerenciais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Relatório Mensal</CardTitle>
            </div>
            <CardDescription>
              Gere um resumo consolidado de todos os parcelamentos do mês atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateReport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-600" />
              <CardTitle>Extrato por Órgão</CardTitle>
            </div>
            <CardDescription>
              Detalhamento de todos os processos agrupados por organização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateReport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar Extrato (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
