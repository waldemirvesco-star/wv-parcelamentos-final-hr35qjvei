import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useInstallmentStore from '@/stores/useInstallmentStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  dataAdesao: z.string().min(1, 'A data de adesão é obrigatória'),
  quantidadeParcelas: z.coerce.number().min(1, 'Deve ter pelo menos 1 parcela'),
  parcelaAtual: z.coerce.number().min(0, 'A parcela atual não pode ser negativa'),
  numeroProcesso: z.string().min(1, 'O número do processo é obrigatório'),
  cnpj: z.string().min(14, 'O CNPJ deve ter no mínimo 14 caracteres'),
  nomeEmpresa: z.string().min(3, 'O nome da empresa é obrigatório'),
  orgao: z.string().min(1, 'Selecione um órgão'),
  metodoEnvio: z.array(z.string()).refine((val) => val.length > 0, {
    message: 'Selecione pelo menos um método de envio',
  }),
  siteParcelamento: z
    .string()
    .url('Insira uma URL válida (ex: https://...)')
    .min(1, 'O site é obrigatório'),
  senhaAcesso: z.string().min(1, 'A senha é obrigatória'),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateInstallment() {
  const navigate = useNavigate()
  const { addInstallment } = useInstallmentStore()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAdesao: new Date().toISOString().split('T')[0],
      quantidadeParcelas: 1,
      parcelaAtual: 0,
      numeroProcesso: '',
      cnpj: '',
      nomeEmpresa: '',
      orgao: '',
      metodoEnvio: [],
      siteParcelamento: '',
      senhaAcesso: '',
    },
  })

  const quantidadeParcelas = form.watch('quantidadeParcelas') || 0
  const parcelaAtual = form.watch('parcelaAtual') || 0
  const parcelasFaltando = Math.max(0, quantidadeParcelas - parcelaAtual)

  const onSubmit = (values: FormValues) => {
    // Calling store update masking as generic expected format for backwards compatibility
    // with table in index page, but saving all new fields
    addInstallment({
      ...values,
      empresa: values.nomeEmpresa,
      dataInicio: values.dataAdesao,
      parcelasTotais: values.quantidadeParcelas,
      valorTotal: 0,
      status: 'Pendente',
      parcelasAtuais: values.parcelaAtual,
    } as any)

    toast({
      title: 'Sucesso',
      description: 'Novo parcelamento criado com sucesso.',
    })

    navigate('/')
  }

  const metodosEnvioOptions = ['Email', 'WhatsApp']

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="text-slate-500 hover:text-slate-800 px-0 mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Dashboard
      </Button>

      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800">Novo Parcelamento</CardTitle>
          <CardDescription className="text-slate-500">
            Preencha os dados abaixo para registrar um novo processo de parcelamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dataAdesao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Data de Adesão</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-slate-50/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroProcesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Número do Processo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 12345.67890/2023-11"
                          className="bg-slate-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeParcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Quantidade de Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" className="bg-slate-50/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parcelaAtual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Parcela Atual</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" className="bg-slate-50/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-slate-700">Parcelas Faltando</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      value={parcelasFaltando}
                      className="bg-slate-100 text-slate-500"
                      tabIndex={-1}
                    />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">CNPJ da Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0001-00"
                          className="bg-slate-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomeEmpresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Razão Social LTDA"
                          className="bg-slate-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orgao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Órgão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50">
                            <SelectValue placeholder="Selecione o órgão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Receita Federal">Receita Federal</SelectItem>
                          <SelectItem value="Estado SP">Estado SP</SelectItem>
                          <SelectItem value="Prefeitura">Prefeitura</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteParcelamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Site do Parcelamento</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          className="bg-slate-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senhaAcesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Senha de Acesso</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="bg-slate-50/50 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodoEnvio"
                  render={() => (
                    <FormItem className="md:col-span-2">
                      <div className="mb-4">
                        <FormLabel className="text-slate-700 text-base">Método de Envio</FormLabel>
                      </div>
                      <div className="flex gap-6">
                        {metodosEnvioOptions.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="metodoEnvio"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== item),
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="text-slate-600 border-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95"
                >
                  Salvar Parcelamento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
