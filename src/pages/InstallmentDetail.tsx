import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ArrowLeft, CheckCircle, Edit, Save, X, Eye, EyeOff, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getParcelamento, updateParcelamento } from '@/services/parcelamentos'
import { getHistorico, createHistorico } from '@/services/historico'

const ViewField = ({ label, value }: { label: string; value?: string | number }) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="text-base text-slate-900 mt-1 font-medium">{value || '-'}</p>
  </div>
)

export default function InstallmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const [installment, setInstallment] = useState<any>(null)
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [formData, setFormData] = useState<any>({})
  const [showPassword, setShowPassword] = useState(false)

  const loadData = async () => {
    if (!id) return
    try {
      const data = await getParcelamento(id)
      setInstallment(data)
      setFormData(data)

      const history = await getHistorico(id)
      setHistoryLogs(history)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando detalhes...</div>
  }

  if (!installment) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Parcelamento não encontrado</h2>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      const changedKeys = Object.keys(formData).filter((key) => {
        const v1 = JSON.stringify(formData[key])
        const v2 = JSON.stringify(installment[key])
        return v1 !== v2
      })

      for (const key of changedKeys) {
        if (
          [
            'id',
            'created',
            'updated',
            'usuario_id',
            'collectionId',
            'collectionName',
            'expand',
          ].includes(key)
        )
          continue

        await createHistorico({
          parcelamento_id: installment.id,
          campo_alterado: key,
          valor_anterior: JSON.stringify(installment[key] || ''),
          valor_novo: JSON.stringify(formData[key] || ''),
        })
      }

      await updateParcelamento(installment.id, formData)
      setIsEditing(false)
      toast({ title: 'Alterações salvas', description: 'O parcelamento foi atualizado.' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar alterações.' })
    }
  }

  const handleClose = async () => {
    try {
      await createHistorico({
        parcelamento_id: installment.id,
        campo_alterado: 'status',
        valor_anterior: installment.status,
        valor_novo: 'Encerrado',
      })
      await updateParcelamento(installment.id, { status: 'Encerrado' })
      toast({ title: 'Parcelamento Encerrado', description: 'O status foi alterado.' })
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao encerrar.' })
    }
  }

  const missing = Number(formData.quantidade_parcelas || 0) - Number(formData.parcela_atual || 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detalhes do Parcelamento</h1>
            <p className="text-sm text-slate-500">Visualizar e gerenciar informações do registro</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!isEditing ? (
            <>
              {installment.status !== 'Encerrado' && (
                <Button
                  variant="outline"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 flex-1 sm:flex-none"
                  onClick={handleClose}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Encerrar
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(installment)
                }}
                className="flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-none">
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <span className="text-sm font-medium text-slate-600">Status atual:</span>
        <Badge
          variant={installment.status === 'Encerrado' ? 'secondary' : 'default'}
          className="bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-none"
        >
          {installment.status}
        </Badge>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Nome da Empresa" value={installment.empresa_nome} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="CNPJ" value={installment.cnpj} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Órgão" value={installment.orgao} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Número do Processo" value={installment.numero_processo} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Detalhes Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Data de Adesão" value={installment.data_adesao} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Quantidade de Parcelas" value={installment.quantidade_parcelas} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Parcela Atual" value={installment.parcela_atual} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Parcelas Faltando" value={Math.max(0, missing)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 md:col-span-2">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Acesso e Envio</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <ViewField label="Método de Envio" value={installment.metodo_envio?.join(', ')} />
              <ViewField label="Site do Parcelamento" value={installment.site_url} />
              <div>
                <p className="text-sm font-medium text-slate-500">Senha de Acesso</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-base text-slate-900 font-medium">
                    {showPassword
                      ? installment.senha_acesso
                      : installment.senha_acesso
                        ? '••••••••'
                        : '-'}
                  </span>
                  {installment.senha_acesso && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-slate-500 hover:text-slate-900"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg text-slate-800">Modo de Edição</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={formData.empresa_nome || ''}
                onChange={(e) => setFormData({ ...formData, empresa_nome: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ da Empresa</Label>
              <Input
                value={formData.cnpj || ''}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Órgão</Label>
              <Select
                value={formData.orgao || ''}
                onValueChange={(v) => setFormData({ ...formData, orgao: v })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita Federal">Receita Federal</SelectItem>
                  <SelectItem value="Estado SP">Estado SP</SelectItem>
                  <SelectItem value="Prefeitura">Prefeitura</SelectItem>
                  <SelectItem value="PGFN">PGFN</SelectItem>
                  <SelectItem value="Secretaria da Fazenda">Secretaria da Fazenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número do Processo</Label>
              <Input
                value={formData.numero_processo || ''}
                onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Adesão</Label>
              <Input
                type="date"
                value={formData.data_adesao || ''}
                onChange={(e) => setFormData({ ...formData, data_adesao: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade de Parcelas</Label>
              <Input
                type="number"
                value={formData.quantidade_parcelas || ''}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade_parcelas: Number(e.target.value) })
                }
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Parcela Atual</Label>
              <Input
                type="number"
                value={formData.parcela_atual || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parcela_atual: Number(e.target.value) })
                }
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Parcelas Faltando</Label>
              <Input
                value={Math.max(0, missing)}
                disabled
                className="bg-slate-50 font-medium text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Site do Parcelamento</Label>
              <Input
                value={formData.site_url || ''}
                onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label>Senha de Acesso</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha_acesso || ''}
                  onChange={(e) => setFormData({ ...formData, senha_acesso: e.target.value })}
                  className="pr-10 bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion
        type="single"
        collapsible
        className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <AccordionItem value="history" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline transition-colors">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <History className="w-5 h-5 text-slate-400" />
              Histórico de Alterações
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0 pt-0">
            <div className="border-t border-slate-100 p-6">
              {historyLogs.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">
                  Nenhuma alteração registrada até o momento.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold text-slate-700">Data</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Campo Alterado</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Valor Anterior</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Novo Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(log.created).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {log.campo_alterado}
                          </td>
                          <td className="py-3 px-4 text-slate-400 line-through">
                            {log.valor_anterior}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium flex items-center gap-1.5">
                            {log.valor_novo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
