import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart2, Search, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getParcelamentosPaginated } from '@/services/parcelamentos'
import { useRealtime } from '@/hooks/use-realtime'

export default function Relatorios() {
  const { toast } = useToast()

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // For a management report dashboard, we fetch a generous page limit or implement full client side
      // Here we fetch a large page to demonstrate the table functionality.
      const res = await getParcelamentosPaginated(
        1,
        200,
        search,
        statusFilter,
        'Todos',
        'Todos',
        'Todos',
        '',
        '',
      )
      setData(res.items)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar os dados para o relatório.',
      })
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 400)
    return () => clearTimeout(timer)
  }, [loadData])

  useRealtime('parcelamentos', () => {
    loadData()
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatório Gerencial</h2>
        <p className="text-slate-500 mt-1">
          Acompanhe as datas de envio e progresso dos parcelamentos.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-600" />
              Painel de Acompanhamento
            </CardTitle>
            <CardDescription>Visão geral de envios e parcelas faltantes.</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
                <SelectItem value="Rompido">Rompido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Empresa / CNPJ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Situação</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Data do Último Envio
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Parcelas Totais
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Parcelas Enviadas
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">
                    Parcelas Faltantes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      Nenhum parcelamento encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const total = item.parcelas_totais || item.quantidade_parcelas || 0
                    const faltantes = Math.max(0, total - (item.parcela_atual || 0))
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-900">
                          {item.empresa_nome}
                          <div className="text-xs text-slate-500 font-normal mt-0.5">
                            {item.cnpj}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.situacao === 'Encerrado' ? 'secondary' : 'default'}
                            className={
                              item.situacao === 'Encerrado'
                                ? 'bg-slate-100 text-slate-700'
                                : item.situacao === 'Rompido'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                  : ''
                            }
                          >
                            {item.situacao}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {item.data_ultimo_envio
                            ? new Date(item.data_ultimo_envio).toLocaleDateString('pt-BR', {
                                timeZone: 'UTC',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center font-medium">{total}</TableCell>
                        <TableCell className="text-center text-emerald-600 font-semibold">
                          {item.parcela_atual || 0}
                        </TableCell>
                        <TableCell className="text-center text-amber-600 font-semibold">
                          {faltantes}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
