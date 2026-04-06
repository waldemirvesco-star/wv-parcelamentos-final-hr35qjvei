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
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'

const statusColors: Record<string, string> = {
  Ativo: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  Encerrado: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  Enviado: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
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
  statusFilter: string
  onStatusFilterChange: (val: string) => void
  itemsPerPage: number
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
  statusFilter,
  onStatusFilterChange,
  itemsPerPage,
}: InstallmentTableProps) {
  const navigate = useNavigate()
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
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por CNPJ ou Empresa..."
            className="pl-9 bg-white"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
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
                    <Badge variant="outline" className={statusColors[item.status] || ''}>
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
