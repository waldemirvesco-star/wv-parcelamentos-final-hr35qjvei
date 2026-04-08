import { Link } from 'react-router-dom'
import { Eye, Trash2, Download, Search, Pencil } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'

interface InstallmentTableProps {
  data: any[]
  onDelete: (id: string) => void
  page: number
  onPageChange: (page: number) => void
  totalPages: number
  totalRecords: number
  searchInput: string
  onSearchChange: (val: string) => void
  situacaoFilter: string
  onSituacaoFilterChange: (val: string) => void
  statusEnvioFilter: string
  onStatusEnvioFilterChange: (val: string) => void
  orgaoFilter: string
  onOrgaoFilterChange: (val: string) => void
  metodoEnvioFilter: string
  onMetodoEnvioFilterChange: (val: string) => void
  dateStart: string
  onDateStartChange: (val: string) => void
  dateEnd: string
  onDateEndChange: (val: string) => void
  onExportCsv: () => void
  itemsPerPage: number
  onEdit: (item: any) => void
}

export function InstallmentTable({
  data,
  onDelete,
  page,
  onPageChange,
  totalPages,
  totalRecords,
  searchInput,
  onSearchChange,
  situacaoFilter,
  onSituacaoFilterChange,
  statusEnvioFilter,
  onStatusEnvioFilterChange,
  orgaoFilter,
  onOrgaoFilterChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  onExportCsv,
  onEdit,
}: InstallmentTableProps) {
  const getStatusEnvioColor = (status: string) => {
    switch (status) {
      case 'Enviado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Pendente':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Ativo':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Encerrado':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'Rompido':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Buscar</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="CNPJ ou Empresa..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full sm:w-auto space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Situação</label>
          <Select value={situacaoFilter} onValueChange={onSituacaoFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Encerrado">Encerrado</SelectItem>
              <SelectItem value="Rompido">Rompido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Status Envio</label>
          <Select value={statusEnvioFilter} onValueChange={onStatusEnvioFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Órgão</label>
          <Select value={orgaoFilter} onValueChange={onOrgaoFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Receita Federal">Receita Federal</SelectItem>
              <SelectItem value="Estado SP">Estado SP</SelectItem>
              <SelectItem value="Prefeitura">Prefeitura</SelectItem>
              <SelectItem value="PGFN">PGFN</SelectItem>
              <SelectItem value="Secretaria da Fazenda">Sec. da Fazenda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Início</label>
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <div className="w-full sm:w-auto space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Fim</label>
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <Button
          variant="outline"
          onClick={onExportCsv}
          className="w-full sm:w-auto ml-auto flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Empresa / CNPJ</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Adesão</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum parcelamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{item.empresa_nome}</div>
                    <div className="text-xs text-slate-500">{item.cnpj}</div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.orgao || '-'}</TableCell>
                  <TableCell className="text-slate-600">
                    {item.data_adesao
                      ? new Date(item.data_adesao).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {item.parcela_atual || 0} /{' '}
                    {item.parcelas_totais || item.quantidade_parcelas || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSituacaoColor(item.situacao)}>
                      {item.situacao || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusEnvioColor(item.status_envio)}>
                      {item.status_envio || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Link to={`/parcelamento/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-500">
          Mostrando {data.length} de {totalRecords} registros
        </div>

        {totalPages > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) onPageChange(page - 1)
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  href="#"
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(i + 1)
                    }}
                    isActive={page === i + 1}
                    className="cursor-pointer"
                    href="#"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) onPageChange(page + 1)
                  }}
                  className={
                    page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                  href="#"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
