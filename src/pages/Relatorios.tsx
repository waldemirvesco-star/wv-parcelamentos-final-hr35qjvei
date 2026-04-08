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

  const escapeHtml = (unsafe: string | number | null | undefined) => {
    if (unsafe === null || unsafe === undefined) return '-'
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há dados para exportar.',
      })
      return
    }

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          .text-col { mso-number-format:"\\@"; }
        </style>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>CNPJ</th>
              <th>Empresa Nome</th>
              <th>Órgão</th>
              <th>Data de Adesão</th>
              <th>Quantidade de Parcelas</th>
              <th>Parcela Atual</th>
              <th>Situação</th>
              <th>Status de Envio</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) =>
                  '<tr>' +
                  '<td class="text-col">' +
                  escapeHtml(item.cnpj) +
                  '</td>' +
                  '<td>' +
                  escapeHtml(item.empresa_nome) +
                  '</td>' +
                  '<td>' +
                  escapeHtml(item.orgao) +
                  '</td>' +
                  '<td>' +
                  escapeHtml(item.data_adesao) +
                  '</td>' +
                  '<td>' +
                  (item.quantidade_parcelas || 0) +
                  '</td>' +
                  '<td>' +
                  (item.parcela_atual || 0) +
                  '</td>' +
                  '<td>' +
                  escapeHtml(item.situacao) +
                  '</td>' +
                  '<td>' +
                  escapeHtml(item.status_envio) +
                  '</td>' +
                  '</tr>',
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'gestao_parcelamentos.xls'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        onExportCsv={handleExportExcel}
        onMarkAsSent={handleMarkAsSent}
      />
    </div>
  )
}
