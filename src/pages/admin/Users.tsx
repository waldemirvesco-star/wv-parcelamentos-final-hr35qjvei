import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, UserCircle, Shield, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getUsers, createUser, updateUser, type User } from '@/services/users'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Standard User' as 'Admin' | 'Standard User',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data as User[])
    } catch (err) {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useRealtime('users', () => {
    loadUsers()
  })

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'Standard User' })
    setErrors({})
    setDialogOpen(true)
  }

  const openEditDialog = (u: User) => {
    setEditingUser(u)
    setFormData({ name: u.name, email: u.email, password: '', role: u.role })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        })
        toast.success('Usuário atualizado com sucesso')
      } else {
        await createUser({
          ...formData,
          active: true,
        })
        toast.success('Usuário criado com sucesso')
      }
      setDialogOpen(false)
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setErrors(fieldErrs)
        toast.error('Verifique os campos do formulário')
      } else {
        toast.error('Ocorreu um erro ao salvar o usuário')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error('Você não pode desativar sua própria conta')
      return
    }
    try {
      await updateUser(u.id, { active: !u.active })
      toast.success(`Usuário ${u.active ? 'desativado' : 'ativado'} com sucesso`)
    } catch (err) {
      toast.error('Erro ao alterar status do usuário')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie acessos, papéis e status dos usuários do sistema.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{u.name || 'Sem nome'}</span>
                      <span className="text-sm text-slate-500">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {u.role === 'Admin' ? (
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                      ) : (
                        <UserCircle className="h-4 w-4 text-slate-400" />
                      )}
                      <span className={u.role === 'Admin' ? 'font-medium' : ''}>{u.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.active ? 'default' : 'secondary'}
                      className={
                        u.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''
                      }
                    >
                      {u.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(new Date(u.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(u)}>
                          Editar usuário
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleStatus(u)}
                          disabled={u.id === currentUser?.id}
                          className={u.active ? 'text-red-600' : 'text-emerald-600'}
                        >
                          {u.active ? 'Desativar acesso' : 'Ativar acesso'}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João da Silva"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@exemplo.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            {!editingUser && (
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(val: any) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard User">Usuário Padrão</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
