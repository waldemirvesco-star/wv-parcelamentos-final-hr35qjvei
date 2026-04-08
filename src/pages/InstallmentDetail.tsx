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
import { ArrowLeft, CheckCircle, Edit, Save, X, Eye, EyeOff, History, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getParcelamento, updateParcelamento } from '@/services/parcelamentos'
import { getHistorico, createHistorico } from '@/services/historico'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { getNextMonthBusinessDay } from '@/lib/business-days'

const formatVal = (v: any) =>
  v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)

const ViewField = ({
  label,
  value,
  className,
}: {
  label: string
  value?: string | number
  className?: string
}) => (
  <div className="min-w-0 flex flex-col">
    <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
    <p className={cn('text-base text-slate-900 mt-1 font-medium', className)}>{value || '-'}</p>
  </div>
)

const Field = ({ label, error, children }: any) => (
  <div className="space-y-1 flex flex-col">
    <Label className={cn(error && 'text-destructive')}>{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
)

export default function InstallmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [installment, setInstallment] = useState<any>(null)
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [formData, setFormData] = useState<any>({})
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = async () => {
    if (!id) return
    try {
      const [data, history] = await Promise.all([getParcelamento(id), getHistorico(id)])
      setInstallment(data)
      setHistoryLogs(history)
      if (isEditing && Object.keys(formData).length === 0) setFormData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('parcelamentos', (e) => {
    if (e.record.id === id) loadData()
  })

  useRealtime('historico_alteracoes', (e) => {
    if (e.record.parcelamento_id === id) loadData()
  })

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
    setFieldErrors({})
    try {
      let dataToSave = { ...formData }

      // Auto recalculate data_limite_envio if dia_util_limite changes
      if (
        dataToSave.dia_util_limite &&
        dataToSave.dia_util_limite !== installment.dia_util_limite
      ) {
        dataToSave.data_limite_envio = getNextMonthBusinessDay(dataToSave.dia_util_limite)
      }

      // Auto recalculate quantidade_parcelas (faltando) if totais or atual changed
      if (
        dataToSave.parcelas_totais !== installment.parcelas_totais ||
        dataToSave.parcela_atual !== installment.parcela_atual
      ) {
        const total = dataToSave.parcelas_totais || installment.parcelas_totais || 0
        const atual = dataToSave.parcela_atual || installment.parcela_atual || 0
        dataToSave.quantidade_parcelas = Math.max(0, total - atual)
      }

      const changedKeys = Object.keys(dataToSave).filter((key) => {
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
          return false
        return formatVal(dataToSave[key]) !== formatVal(installment[key])
      })

      if (changedKeys.length === 0) {
        setIsEditing(false)
        return
      }

      await Promise.all(
        changedKeys.map((key) =>
          createHistorico({
            parcelamento_id: installment.id,
            usuario_id: user?.id,
            campo_alterado: key,
            valor_anterior: formatVal(installment[key]),
            valor_novo: formatVal(dataToSave[key]),
          }),
        ),
      )

      await updateParcelamento(installment.id, dataToSave)
      setIsEditing(false)
      toast({
        title: 'Alterações salvas',
        description: 'O parcelamento foi atualizado com sucesso.',
      })
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar as alterações.' })
    }
  }

  const handleMarkAsSent = async () => {
    setIsSending(true)
    try {
      const newParcelaAtual = (installment.parcela_atual || 0) + 1
      const total =
        installment.parcelas_totais ||
        (installment.quantidade_parcelas || 0) + (installment.parcela_atual || 0)
      const newQuantidade = Math.max(0, total - newParcelaAtual)
      const dataUltimoEnvio = new Date().toISOString().split('T')[0]

      let newSituacao = installment.situacao
      if (newParcelaAtual >= total) {
        newSituacao = 'Encerrado'
      }

      const updates: any = {
        parcela_atual: newParcelaAtual,
        quantidade_parcelas: newQuantidade,
        status_envio: 'Enviado',
        data_ultimo_envio: dataUltimoEnvio,
        situacao: newSituacao,
      }

      const logs = Object.keys(updates)
        .filter((k) => updates[k] !== installment[k])
        .map((key) =>
          createHistorico({
            parcelamento_id: installment.id,
            usuario_id: user?.id,
            campo_alterado: key,
            valor_anterior: formatVal(installment[key]),
            valor_novo: formatVal(updates[key]),
          }),
        )

      await Promise.all(logs)
      await updateParcelamento(installment.id, updates)

      toast({
        title: 'Sucesso',
        description: 'Parcelamento marcado como enviado.',
        variant: 'default',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível marcar como enviado.',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = async () => {
    try {
      await createHistorico({
        parcelamento_id: installment.id,
        usuario_id: user?.id,
        campo_alterado: 'situacao',
        valor_anterior: installment.situacao,
        valor_novo: 'Encerrado',
      })
      await updateParcelamento(installment.id, { situacao: 'Encerrado' })
      toast({
        title: 'Parcelamento Encerrado',
        description: 'A situação foi alterada para encerrado.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao encerrar o parcelamento.',
      })
    }
  }

  const dataLimiteFormatada = installment.data_limite_envio
    ? new Date(installment.data_limite_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : '-'
  const dataUltimoEnvioFormatada = installment.data_ultimo_envio
    ? new Date(installment.data_ultimo_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : '-'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="bg-white shrink-0"
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
              {installment.situacao !== 'Encerrado' && (
                <Button
                  onClick={handleMarkAsSent}
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  <Send className="w-4 h-4 mr-2" /> Marcar como Enviado
                </Button>
              )}
              {installment.situacao !== 'Encerrado' && installment.situacao !== 'Rompido' && (
                <Button
                  variant="outline"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 flex-1 sm:flex-none"
                  onClick={handleClose}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Encerrar
                </Button>
              )}
              <Button
                onClick={() => {
                  setFormData(installment)
                  setIsEditing(true)
                }}
                className="flex-1 sm:flex-none"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFieldErrors({})
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

      <div className="flex gap-3 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Situação:</span>
          <Badge
            variant={
              installment.situacao === 'Encerrado' || installment.situacao === 'Rompido'
                ? 'secondary'
                : 'default'
            }
            className={cn(
              'shadow-none',
              installment.situacao === 'Rompido' && 'bg-red-100 text-red-700 hover:bg-red-100',
              installment.situacao === 'Encerrado' &&
                'bg-slate-200 text-slate-700 hover:bg-slate-200',
            )}
          >
            {installment.situacao || '-'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium text-slate-600">Status Envio:</span>
          <Badge
            variant={installment.status_envio === 'Pendente' ? 'outline' : 'default'}
            className={cn(
              'shadow-none',
              installment.status_envio === 'Enviado' &&
                'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
              installment.status_envio === 'Pendente' &&
                'bg-amber-100 text-amber-700 hover:bg-amber-100 border-transparent',
            )}
          >
            {installment.status_envio || '-'}
          </Badge>
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200 md:col-span-2">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
              <div className="col-span-2 sm:col-span-2">
                <ViewField label="Empresa" value={installment.empresa_nome} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="CNPJ" value={installment.cnpj} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Órgão" value={installment.orgao} />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <ViewField label="Processo" value={installment.numero_processo} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Detalhes Financeiros</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2 sm:col-span-1">
                <ViewField
                  label="Adesão"
                  value={
                    installment.data_adesao
                      ? new Date(installment.data_adesao).toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                        })
                      : '-'
                  }
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField
                  label="Parcelas Totais"
                  value={
                    installment.parcelas_totais ||
                    installment.quantidade_parcelas + installment.parcela_atual
                  }
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Parcela Atual" value={installment.parcela_atual} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Parcelas Faltantes" value={installment.quantidade_parcelas} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Prazos e Envios</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Dia Útil Limite" value={installment.dia_util_limite} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Data Limite (Próx. Mês)" value={dataLimiteFormatada} />
              </div>
              <div className="col-span-2 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <ViewField label="Último Envio Realizado" value={dataUltimoEnvioFormatada} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 md:col-span-2">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg text-slate-800">Acesso e Credenciais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <ViewField label="Método de Envio" value={installment.metodo_envio?.join(', ')} />
              <ViewField
                label="Site do Parcelamento"
                value={installment.site_url}
                className="break-all"
              />
              <div className="min-w-0 flex flex-col">
                <p className="text-sm font-medium text-slate-500 truncate">Senha de Acesso</p>
                <div className="flex items-center gap-3 mt-1 overflow-hidden">
                  <span className="text-base text-slate-900 font-medium truncate">
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
                      className="h-6 px-2 text-slate-500 hover:text-slate-900 shrink-0"
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
            <Field label="Nome da Empresa" error={fieldErrors.empresa_nome}>
              <Input
                value={formData.empresa_nome || ''}
                onChange={(e) => setFormData({ ...formData, empresa_nome: e.target.value })}
                className={cn(
                  fieldErrors.empresa_nome && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </Field>
            <Field label="CNPJ da Empresa" error={fieldErrors.cnpj}>
              <Input
                value={formData.cnpj || ''}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className={cn(
                  fieldErrors.cnpj && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </Field>
            <Field label="Órgão" error={fieldErrors.orgao}>
              <Select
                value={formData.orgao || ''}
                onValueChange={(v) => setFormData({ ...formData, orgao: v })}
              >
                <SelectTrigger
                  className={cn(fieldErrors.orgao && 'border-destructive focus:ring-destructive')}
                >
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
            </Field>
            <Field label="Número do Processo" error={fieldErrors.numero_processo}>
              <Input
                value={formData.numero_processo || ''}
                onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                className={cn(fieldErrors.numero_processo && 'border-destructive')}
              />
            </Field>
            <Field label="Data de Adesão" error={fieldErrors.data_adesao}>
              <Input
                type="date"
                value={formData.data_adesao || ''}
                onChange={(e) => setFormData({ ...formData, data_adesao: e.target.value })}
                className={cn(fieldErrors.data_adesao && 'border-destructive')}
              />
            </Field>
            <Field label="Dia Útil Limite" error={fieldErrors.dia_util_limite}>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dia_util_limite || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dia_util_limite: Number(e.target.value) })
                }
                className={cn(fieldErrors.dia_util_limite && 'border-destructive')}
              />
            </Field>
            <Field label="Total de Parcelas" error={fieldErrors.parcelas_totais}>
              <Input
                type="number"
                value={formData.parcelas_totais || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parcelas_totais: Number(e.target.value) })
                }
                className={cn(fieldErrors.parcelas_totais && 'border-destructive')}
              />
            </Field>
            <Field label="Parcela Atual" error={fieldErrors.parcela_atual}>
              <Input
                type="number"
                value={formData.parcela_atual || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parcela_atual: Number(e.target.value) })
                }
                className={cn(fieldErrors.parcela_atual && 'border-destructive')}
              />
            </Field>
            <Field label="Situação" error={fieldErrors.situacao}>
              <Select
                value={formData.situacao || ''}
                onValueChange={(v) => setFormData({ ...formData, situacao: v })}
              >
                <SelectTrigger
                  className={cn(
                    fieldErrors.situacao && 'border-destructive focus:ring-destructive',
                  )}
                >
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Rompido">Rompido</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status de Envio" error={fieldErrors.status_envio}>
              <Select
                value={formData.status_envio || ''}
                onValueChange={(v) => setFormData({ ...formData, status_envio: v })}
              >
                <SelectTrigger
                  className={cn(
                    fieldErrors.status_envio && 'border-destructive focus:ring-destructive',
                  )}
                >
                  <SelectValue placeholder="Selecione o status de envio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Site do Parcelamento" error={fieldErrors.site_url}>
              <Input
                value={formData.site_url || ''}
                onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                className={cn(fieldErrors.site_url && 'border-destructive')}
              />
            </Field>
            <Field label="Senha de Acesso" error={fieldErrors.senha_acesso}>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha_acesso || ''}
                  onChange={(e) => setFormData({ ...formData, senha_acesso: e.target.value })}
                  className={cn('pr-10', fieldErrors.senha_acesso && 'border-destructive')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </Field>
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
                        <th className="py-3 px-4 font-semibold text-slate-700">Usuário</th>
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
                            {log.expand?.usuario_id?.name || 'Usuário'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {log.campo_alterado}
                          </td>
                          <td className="py-3 px-4 text-slate-400 line-through">
                            {log.valor_anterior}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium">
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
