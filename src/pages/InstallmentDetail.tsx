import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ArrowLeft, CheckCircle, Edit, Save, X, Eye, EyeOff, History } from 'lucide-react'
import useInstallmentStore, { Installment } from '@/stores/useInstallmentStore'
import { useToast } from '@/hooks/use-toast'

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
  const { installments, updateInstallment } = useInstallmentStore()
  const { toast } = useToast()

  const installment = useMemo(() => installments.find((i) => i.id === id), [installments, id])
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true')
  const [formData, setFormData] = useState<Partial<Installment>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (installment && !isEditing) setFormData(installment)
  }, [installment, isEditing])

  if (!installment) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Parcelamento não encontrado</h2>
        <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    )
  }

  const handleSave = () => {
    const log =
      formData.parcelasAtuais !== installment.parcelasAtuais
        ? {
            data: new Date().toISOString(),
            campo: 'Parcela Atual',
            valorAnterior: String(installment.parcelasAtuais || '0'),
            novoValor: String(formData.parcelasAtuais || '0'),
          }
        : undefined

    updateInstallment(installment.id, formData, log)
    setIsEditing(false)
    toast({ title: 'Alterações salvas', description: 'O parcelamento foi atualizado com sucesso.' })
  }

  const handleClose = () => {
    updateInstallment(
      installment.id,
      { status: 'Encerrado' },
      {
        data: new Date().toISOString(),
        campo: 'Status',
        valorAnterior: installment.status,
        novoValor: 'Encerrado',
      },
    )
    toast({ title: 'Parcelamento Encerrado', description: 'O status foi alterado para Encerrado.' })
  }

  const missing = Number(formData.parcelasTotais || 0) - Number(formData.parcelasAtuais || 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
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
        <span className="text-sm font-medium text-slate-600">Status atual do parcelamento:</span>
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
                <ViewField label="Nome da Empresa" value={installment.empresa} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="CNPJ" value={installment.cnpj} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Órgão" value={installment.orgao} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Número do Processo" value={installment.numeroProcesso} />
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
                  label="Data de Adesão"
                  value={
                    installment.dataInicio
                      ? new Date(installment.dataInicio).toLocaleDateString('pt-BR')
                      : undefined
                  }
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Quantidade de Parcelas" value={installment.parcelasTotais} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <ViewField label="Parcela Atual" value={installment.parcelasAtuais} />
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
              <ViewField label="Método de Envio" value={installment.metodoEnvio} />
              <ViewField label="Site do Parcelamento" value={installment.site} />
              <div>
                <p className="text-sm font-medium text-slate-500">Senha de Acesso</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-base text-slate-900 font-medium">
                    {showPassword ? installment.senha : installment.senha ? '••••••••' : '-'}
                  </span>
                  {installment.senha && (
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
                value={formData.empresa || ''}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
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
              <Input
                value={formData.orgao || ''}
                onChange={(e) => setFormData({ ...formData, orgao: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Número do Processo</Label>
              <Input
                value={formData.numeroProcesso || ''}
                onChange={(e) => setFormData({ ...formData, numeroProcesso: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Adesão</Label>
              <Input
                type="date"
                value={formData.dataInicio || ''}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade de Parcelas</Label>
              <Input
                type="number"
                value={formData.parcelasTotais || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parcelasTotais: Number(e.target.value) })
                }
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Parcela Atual</Label>
              <Input
                type="number"
                value={formData.parcelasAtuais || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parcelasAtuais: Number(e.target.value) })
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
              <Label>Método de Envio</Label>
              <Input
                value={formData.metodoEnvio || ''}
                onChange={(e) => setFormData({ ...formData, metodoEnvio: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Site do Parcelamento</Label>
              <Input
                value={formData.site || ''}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label>Senha de Acesso</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha || ''}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
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
              {!installment.historico || installment.historico.length === 0 ? (
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
                      {installment.historico.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(log.data).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">{log.campo}</td>
                          <td className="py-3 px-4 text-slate-400 line-through">
                            {log.valorAnterior}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium flex items-center gap-1.5">
                            {log.novoValor}
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
