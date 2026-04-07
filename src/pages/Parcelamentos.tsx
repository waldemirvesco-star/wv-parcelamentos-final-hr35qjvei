import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstallmentTable } from '@/components/dashboard/InstallmentTable'
import { useToast } from '@/hooks/use-toast'
import {
  getParcelamentosPaginated,
  deleteParcelamento,
  getAllParcelamentosFiltered,
} from '@/services/parcelamentos'
import { useRealtime } from '@/hooks/use-realtime'

export default function Parcelamentos() {
  const [installments, setInstallments] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('Todas')
  const [statusEnvioFilter, setStatusEnvioFilter] = useState('Todos')

  // Advanced filters
  const [orgaoFilter, setOrgaoFilter] = useState('Todos')
  const [metodoEnvioFilter, setMetodoEnvioFilter] = useState('Todos')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

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
      const paginatedData = await getParcelamentosPaginated(
        page,
        ITEMS_PER_PAGE,
        searchTerm,
        situacaoFilter,
        statusEnvioFilter,
        orgaoFilter,
        metodoEnvioFilter,
        dateStart,
        dateEnd,
      )
      setInstallments(paginatedData.items)
      setTotalPages(paginatedData.totalPages)
      setTotalRecords(paginatedData.totalItems)
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
            `"${item.parcela_atual || 0}/${item.quantidade_parcelas || 0}"`,
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Parcelamentos</h1>
          <p className="text-slate-500 mt-1">Gerencie todos os processos e tributos.</p>
        </div>
        <Link to="/novo-parcelamento">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow">
            <Plus className="mr-2 h-4 w-4" />
            Novo Parcelamento
          </Button>
        </Link>
      </div>

      <div className="animate-slide-up">
        <InstallmentTable
          data={installments}
          onDelete={handleDelete}
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
    </div>
  )
}
