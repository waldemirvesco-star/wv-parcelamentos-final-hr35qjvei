import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Archive, Send, AlertCircle, Plus, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/StatCard'
import { InstallmentTable } from '@/components/dashboard/InstallmentTable'
import { DistributionChart } from '@/components/dashboard/DistributionChart'
import { EditInstallmentModal } from '@/components/dashboard/EditInstallmentModal'
import { useToast } from '@/hooks/use-toast'
import {
  getParcelamentosPaginated,
  getParcelamentosStats,
  deleteParcelamento,
  getAllParcelamentosFiltered,
  getDistributionByOrgao,
} from '@/services/parcelamentos'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const [installments, setInstallments] = useState<any[]>([])
  const [stats, setStats] = useState({
    ativos: 0,
    encerrados: 0,
    rompidos: 0,
    enviados: 0,
    pendentes: 0,
  })
  const [distribution, setDistribution] = useState<{ orgao: string; value: number }[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('Todas')
  const [statusEnvioFilter, setStatusEnvioFilter] = useState('Todos')
  const [orgaoFilter, setOrgaoFilter] = useState('Todos')
  const [metodoEnvioFilter, setMetodoEnvioFilter] = useState('Todos')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const [editingItem, setEditingItem] = useState<any>(null)

  const { toast } = useToast()

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadData = useCallback(async () => {
    try {
      const [paginatedData, statsData, distData] = await Promise.all([
        getParcelamentosPaginated(
          page,
          ITEMS_PER_PAGE,
          searchTerm,
          situacaoFilter,
          statusEnvioFilter,
          orgaoFilter,
          metodoEnvioFilter,
          dateStart,
          dateEnd,
        ),
        getParcelamentosStats(
          searchTerm,
          orgaoFilter,
          metodoEnvioFilter,
          dateStart,
          dateEnd,
          situacaoFilter,
          statusEnvioFilter,
        ),
        getDistributionByOrgao(),
      ])
      setInstallments(paginatedData.items)
      setTotalPages(paginatedData.totalPages)
      setTotalRecords(paginatedData.totalItems)
      setStats(statsData)
      setDistribution(distData)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
    }
  }, [
    page,
    searchTerm,
    situacaoFilter,
    statusEnvioFilter,
    orgaoFilter,
    metodoEnvioFilter,
    dateStart,
    dateEnd,
    toast,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('parcelamentos', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteParcelamento(id)
      toast({
        title: 'Parcelamento excluído',
        description: 'O registro foi removido com sucesso.',
        variant: 'default',
      })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o registro.',
        variant: 'destructive',
      })
    }
  }

  const handleExportCsv = async () => {
    try {
      const data = await getAllParcelamentosFiltered(
        searchTerm,
        situacaoFilter,
        statusEnvioFilter,
        orgaoFilter,
        metodoEnvioFilter,
        dateStart,
        dateEnd,
      )

      const headers = [
        'CNPJ',
        'Empresa',
        'Órgão',
        'Data de Adesão',
        'Parcelas',
        'Situação',
        'Status Envio',
      ]
      const csvContent = [
        headers.join(','),
        ...data.map((item) =>
          [
            `"${item.cnpj}"`,
            `"${item.empresa_nome}"`,
            `"${item.orgao || ''}"`,
            `"${item.data_adesao || ''}"`,
            `"${item.parcela_atual || 0}/${item.parcelas_totais || item.quantidade_parcelas || 0}"`,
            `"${item.situacao || ''}"`,
            `"${item.status_envio || ''}"`,
          ].join(','),
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'parcelamentos.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exportação Concluída',
        description: 'O arquivo CSV foi baixado com sucesso.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados para CSV.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral dos processos e tributos da empresa.</p>
        </div>
        <Link to="/novo-parcelamento">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow">
            <Plus className="mr-2 h-4 w-4" />
            Novo Parcelamento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Parcelamentos Ativos"
            value={stats.ativos}
            icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
            theme="emerald"
          />
          <StatCard
            title="Pendentes de Envio"
            value={stats.pendentes}
            icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
            theme="amber"
          />
          <StatCard
            title="Enviados no Mês"
            value={stats.enviados}
            icon={<Send className="h-6 w-6 text-blue-600" />}
            theme="blue"
          />
          <StatCard
            title="Parcelamentos Rompidos"
            value={stats.rompidos}
            icon={<XCircle className="h-6 w-6 text-red-600" />}
            theme="red"
          />
          <StatCard
            title="Parcelamentos Encerrados"
            value={stats.encerrados}
            icon={<Archive className="h-6 w-6 text-slate-600" />}
            theme="slate"
          />
        </div>
        <div className="lg:col-span-1 h-full">
          <DistributionChart data={distribution} />
        </div>
      </div>

      <div className="animate-slide-up">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Lista de Parcelamentos</h2>
        </div>
        <InstallmentTable
          data={installments}
          onDelete={handleDelete}
          onEdit={setEditingItem}
          page={page}
          onPageChange={setPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          situacaoFilter={situacaoFilter}
          onSituacaoFilterChange={(v) => {
            setSituacaoFilter(v)
            setPage(1)
          }}
          statusEnvioFilter={statusEnvioFilter}
          onStatusEnvioFilterChange={(v) => {
            setStatusEnvioFilter(v)
            setPage(1)
          }}
          orgaoFilter={orgaoFilter}
          onOrgaoFilterChange={(v) => {
            setOrgaoFilter(v)
            setPage(1)
          }}
          metodoEnvioFilter={metodoEnvioFilter}
          onMetodoEnvioFilterChange={(v) => {
            setMetodoEnvioFilter(v)
            setPage(1)
          }}
          dateStart={dateStart}
          onDateStartChange={(v) => {
            setDateStart(v)
            setPage(1)
          }}
          dateEnd={dateEnd}
          onDateEndChange={(v) => {
            setDateEnd(v)
            setPage(1)
          }}
          onExportCsv={handleExportCsv}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      <EditInstallmentModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={loadData}
      />
    </div>
  )
}
