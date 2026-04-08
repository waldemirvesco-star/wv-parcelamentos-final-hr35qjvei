import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  getParcelamentosPaginated,
  deleteParcelamento,
  updateParcelamento,
} from '@/services/parcelamentos'
import { useRealtime } from '@/hooks/use-realtime'
import { InstallmentTable } from '@/components/dashboard/InstallmentTable'

export default function Relatorios() {
  const { toast } = useToast()

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const itemsPerPage = 10

  const [search, setSearch] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('Todos')
  const [statusEnvioFilter, setStatusEnvioFilter] = useState('Todos')
  const [orgaoFilter, setOrgaoFilter] = useState('Todos')
  const [metodoEnvioFilter, setMetodoEnvioFilter] = useState('Todos')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getParcelamentosPaginated(
        page,
        itemsPerPage,
        search,
        situacaoFilter,
        statusEnvioFilter,
        orgaoFilter,
        metodoEnvioFilter,
        dateStart,
        dateEnd,
      )
      setData(res.items)
      setTotalPages(res.totalPages)
      setTotalRecords(res.totalItems)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar os dados para a gestão de parcelamentos.',
      })
    } finally {
      setLoading(false)
    }
  }, [
    page,
    itemsPerPage,
    search,
    situacaoFilter,
    statusEnvioFilter,
    orgaoFilter,
    metodoEnvioFilter,
    dateStart,
    dateEnd,
    toast,
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 400)
    return () => clearTimeout(timer)
  }, [loadData])

  useRealtime('parcelamentos', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteParcelamento(id)
      toast({ title: 'Sucesso', description: 'Parcelamento excluído com sucesso.' })
      loadData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir o parcelamento.',
      })
    }
  }

  const handleMarkAsSent = async (item: any) => {
    try {
      await updateParcelamento(item.id, { status_envio: 'Enviado' })
      toast({ title: 'Sucesso', description: 'Status atualizado para Enviado.' })
      loadData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar o status.',
      })
    }
  }

  const handleExportCsv = () => {
    if (data.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há dados para exportar.',
      })
      return
    }

    const headers = [
      'CNPJ',
      'Empresa',
      'Órgão',
      'Situação',
      'Status Envio',
      'Parcelas Pagas',
      'Total Parcelas',
    ]
    const csvContent = [
      headers.join(','),
      ...data.map((item) =>
        [
          item.cnpj,
          `"${item.empresa_nome}"`,
          item.orgao || '-',
          item.situacao || '-',
          item.status_envio || '-',
          item.parcela_atual || 0,
          item.quantidade_parcelas || 0,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'gestao_parcelamentos.csv'
    link.click()
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestão de Parcelamentos
        </h2>
        <p className="text-slate-500 mt-1">
          Acompanhe o status de envio e a situação de todos os parcelamentos.
        </p>
      </div>

      <InstallmentTable
        data={data}
        onDelete={handleDelete}
        page={page}
        onPageChange={setPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        searchInput={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        situacaoFilter={situacaoFilter}
        onSituacaoFilterChange={(val) => {
          setSituacaoFilter(val)
          setPage(1)
        }}
        statusEnvioFilter={statusEnvioFilter}
        onStatusEnvioFilterChange={(val) => {
          setStatusEnvioFilter(val)
          setPage(1)
        }}
        itemsPerPage={itemsPerPage}
        orgaoFilter={orgaoFilter}
        onOrgaoFilterChange={(val) => {
          setOrgaoFilter(val)
          setPage(1)
        }}
        metodoEnvioFilter={metodoEnvioFilter}
        onMetodoEnvioFilterChange={(val) => {
          setMetodoEnvioFilter(val)
          setPage(1)
        }}
        dateStart={dateStart}
        onDateStartChange={(val) => {
          setDateStart(val)
          setPage(1)
        }}
        dateEnd={dateEnd}
        onDateEndChange={(val) => {
          setDateEnd(val)
          setPage(1)
        }}
        onExportCsv={handleExportCsv}
        onMarkAsSent={handleMarkAsSent}
      />
    </div>
  )
}
