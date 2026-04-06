import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Archive, Send, AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/StatCard'
import { InstallmentTable } from '@/components/dashboard/InstallmentTable'
import { useToast } from '@/hooks/use-toast'
import {
  getParcelamentosPaginated,
  getParcelamentosStats,
  deleteParcelamento,
} from '@/services/parcelamentos'
import { useRealtime } from '@/hooks/use-realtime'

export default function Index() {
  const [installments, setInstallments] = useState<any[]>([])
  const [stats, setStats] = useState({ ativos: 0, encerrados: 0, enviados: 0, pendentes: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
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
      const [paginatedData, statsData] = await Promise.all([
        getParcelamentosPaginated(page, ITEMS_PER_PAGE, searchTerm, statusFilter),
        getParcelamentosStats(),
      ])
      setInstallments(paginatedData.items)
      setTotalPages(paginatedData.totalPages)
      setTotalRecords(paginatedData.totalItems)
      setStats(statsData)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
    }
  }, [page, searchTerm, statusFilter, toast])

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Parcelamentos Ativos"
          value={stats.ativos}
          icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
          theme="emerald"
        />
        <StatCard
          title="Parcelamentos Encerrados"
          value={stats.encerrados}
          icon={<Archive className="h-6 w-6 text-slate-600" />}
          theme="slate"
        />
        <StatCard
          title="Enviados no Mês"
          value={stats.enviados}
          icon={<Send className="h-6 w-6 text-blue-600" />}
          theme="blue"
        />
        <StatCard
          title="Pendentes de Envio"
          value={stats.pendentes}
          icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
          theme="amber"
        />
      </div>

      <div className="animate-slide-up">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Lista de Parcelamentos</h2>
        </div>
        <InstallmentTable
          data={installments}
          onDelete={handleDelete}
          page={page}
          onPageChange={setPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  )
}
