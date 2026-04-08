import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateParcelamento } from '@/services/parcelamentos'
import { useToast } from '@/hooks/use-toast'

export function EditInstallmentModal({
  item,
  onClose,
  onSave,
}: {
  item: any
  onClose: () => void
  onSave: () => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    empresa_nome: '',
    cnpj: '',
    orgao: '',
    situacao: '',
    status_envio: '',
    parcela_atual: 0,
    parcelas_totais: 0,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        empresa_nome: item.empresa_nome || '',
        cnpj: item.cnpj || '',
        orgao: item.orgao || '',
        situacao: item.situacao || '',
        status_envio: item.status_envio || '',
        parcela_atual: item.parcela_atual || 0,
        parcelas_totais: item.parcelas_totais || item.quantidade_parcelas || 0,
      })
    }
  }, [item])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item?.id) return
    setLoading(true)
    try {
      await updateParcelamento(item.id, formData)
      toast({ title: 'Sucesso', description: 'Parcelamento atualizado com sucesso.' })
      onSave()
      onClose()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o parcelamento.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Parcelamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input
                value={formData.empresa_nome}
                onChange={(e) => handleChange('empresa_nome', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Órgão</Label>
              <Select value={formData.orgao} onValueChange={(v) => handleChange('orgao', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita Federal">Receita Federal</SelectItem>
                  <SelectItem value="Estado SP">Estado SP</SelectItem>
                  <SelectItem value="Prefeitura">Prefeitura</SelectItem>
                  <SelectItem value="PGFN">PGFN</SelectItem>
                  <SelectItem value="Secretaria da Fazenda">Sec. da Fazenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select value={formData.situacao} onValueChange={(v) => handleChange('situacao', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Rompido">Rompido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status de Envio</Label>
              <Select
                value={formData.status_envio}
                onValueChange={(v) => handleChange('status_envio', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Parcela Atual</Label>
                <Input
                  type="number"
                  value={formData.parcela_atual}
                  onChange={(e) => handleChange('parcela_atual', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  type="number"
                  value={formData.parcelas_totais}
                  onChange={(e) => handleChange('parcelas_totais', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
