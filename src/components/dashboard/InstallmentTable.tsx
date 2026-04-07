import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, MoreHorizontal, Eye, Edit, Trash2, Filter, Download } from 'lucide-react'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'

const situacaoColors: Record<string, string> = {
  Ativo: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  Encerrado: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  Rompido: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
}

const statusEnvioColors: Record<string, string> = {
  Enviado: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  Pendente: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
}

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
  itemsPerPage: number
  orgaoFilter: string
  onOrgaoFilterChange: (val: string) => void
  metodoEnvioFilter: string
  onMetodoEnvioFilterChange: (val: string) => void
  dateStart: string
  onDateStartChange: (val: string) => void
  dateEnd: string
  onDateEndChange: (val: string) => void
  onExportCsv: () => void
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
  itemsPerPage,
  orgaoFilter,
  onOrgaoFilterChange,
  metodoEnvioFilter,
  onMetodoEnvioFilterChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  onExportCsv,
}: InstallmentTableProps) {
  const navigate = useNavigate()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleAction = (action: string, id: string) => {
    if (action === 'Ver Detalhes') navigate(`/parcelamento/${id}`)
    if (action === 'Editar') navigate(`/parcelamento/${id}?edit=true`)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete)
      setItemToDelete(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por CNPJ ou Empresa..."
              className="pl-9 bg-white"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={situacaoFilter} onValueChange={onSituacaoFilterChange}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas Situações</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
                <SelectItem value="Rompido">Rompido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusEnvioFilter} onValueChange={onStatusEnvioFilterChange}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white">
                <SelectValue placeholder="Status Envio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos Status</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={isFiltersOpen ? 'bg-slate-100' : 'bg-white'}
            >
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
            <Button onClick={onExportCsv} variant="outline" className="bg-white">
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
        </div>

        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="pt-4 border-t border-slate-200 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-medium">Órgão</Label>
                <Select value={orgaoFilter} onValueChange={onOrgaoFilterChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione o órgão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os Órgãos</SelectItem>
                    <SelectItem value="Receita Federal">Receita Federal</SelectItem>
                    <SelectItem value="Estado SP">Estado SP</SelectItem>
                    <SelectItem value="Prefeitura">Prefeitura</SelectItem>
                    <SelectItem value="PGFN">PGFN</SelectItem>
                    <SelectItem value="Secretaria da Fazenda">Secretaria da Fazenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-medium">Método de Envio</Label>
                <Select value={metodoEnvioFilter} onValueChange={onMetodoEnvioFilterChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Método de Envio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-medium">Data Adesão (De)</Label>
                <Input
                  type="date"
                  value={dateStart}
                  onChange={(e) => onDateStartChange(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-medium">Data Adesão (Até)</Label>
                <Input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => onDateEndChange(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold text-slate-700">CNPJ</TableHead>
              <TableHead className="font-semibold text-slate-700">Empresa</TableHead>
              <TableHead className="font-semibold text-slate-700">Órgão</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[200px]">Parcelas</TableHead>
              <TableHead className="font-semibold text-slate-700">Situação</TableHead>
              <TableHead className="font-semibold text-slate-700">Status Envio</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[80px]"></TableHead>
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
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium text-slate-700">{item.cnpj}</TableCell>
                  <TableCell>{item.empresa_nome}</TableCell>
                  <TableCell className="text-slate-600">{item.orgao}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>{item.parcela_atual || 0} pagas</span>
                        <span>de {item.quantidade_parcelas || 0}</span>
                      </div>
                      <Progress
                        value={
                          item.quantidade_parcelas
                            ? ((item.parcela_atual || 0) / item.quantidade_parcelas) * 100
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={situacaoColors[item.situacao] || ''}>
                      {item.situacao || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusEnvioColors[item.status_envio] || ''}>
                      {item.status_envio || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200">
                          <MoreHorizontal className="h-4 w-4 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleAction('Ver Detalhes', item.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Editar', item.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => setItemToDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Mostrando {data.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} até{' '}
          {Math.min(page * itemsPerPage, totalRecords)} de {totalRecords} registros
        </p>
        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm font-medium px-4 text-slate-700">
                Página {page} de {totalPages || 1}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className={
                  page === totalPages || totalPages === 0
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Parcelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este parcelamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
