import { useState, useMemo } from 'react'
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
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { Installment, Status } from '@/stores/useInstallmentStore'
import { useToast } from '@/hooks/use-toast'

const statusColors: Record<Status, string> = {
  Ativo: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  Encerrado: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  Enviado: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
  Pendente: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
}

interface InstallmentTableProps {
  data: Installment[]
  onDelete: (id: string) => void
}

export function InstallmentTable({ data, onDelete }: InstallmentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Todos')
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const ITEMS_PER_PAGE = 5

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cnpj.includes(searchTerm)
      const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [data, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleAction = (action: string) => {
    toast({ title: action, description: `Ação "${action}" selecionada (Mock).` })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por CNPJ ou Empresa..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Encerrado">Encerrado</SelectItem>
            <SelectItem value="Enviado">Enviado</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold text-slate-700">CNPJ</TableHead>
              <TableHead className="font-semibold text-slate-700">Empresa</TableHead>
              <TableHead className="font-semibold text-slate-700">Órgão</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[200px]">Parcelas</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum parcelamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-medium text-slate-700">{item.cnpj}</TableCell>
                  <TableCell>{item.empresa}</TableCell>
                  <TableCell className="text-slate-600">{item.orgao}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>{item.parcelasAtuais} pagas</span>
                        <span>de {item.parcelasTotais}</span>
                      </div>
                      <Progress
                        value={(item.parcelasAtuais / item.parcelasTotais) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.status]}>
                      {item.status}
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
                        <DropdownMenuItem onClick={() => handleAction('Ver Detalhes')}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Editar')}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDelete(item.id)}
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
          Mostrando {filteredData.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} até{' '}
          {Math.min(page * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
        </p>
        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
    </div>
  )
}
