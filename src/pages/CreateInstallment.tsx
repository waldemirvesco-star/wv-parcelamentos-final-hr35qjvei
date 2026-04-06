import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useInstallmentStore from '@/stores/useInstallmentStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  cnpj: z.string().min(14, 'O CNPJ deve ter no mínimo 14 caracteres'),
  empresa: z.string().min(3, 'O nome da empresa é obrigatório'),
  orgao: z.string().min(1, 'Selecione um órgão'),
  valorTotal: z.coerce.number().min(1, 'O valor deve ser maior que zero'),
  parcelasTotais: z.coerce.number().min(1, 'Deve ter pelo menos 1 parcela'),
  dataInicio: z.string().min(1, 'A data de início é obrigatória'),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateInstallment() {
  const navigate = useNavigate()
  const { addInstallment } = useInstallmentStore()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpj: '',
      empresa: '',
      orgao: '',
      valorTotal: 0,
      parcelasTotais: 1,
      dataInicio: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = (values: FormValues) => {
    addInstallment({
      ...values,
      status: 'Pendente',
      parcelasAtuais: 0,
    })

    toast({
      title: 'Sucesso',
      description: 'Novo parcelamento criado com sucesso.',
    })

    navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">CNPJ</FormLabel>
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
                  name="empresa"
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
                      <FormLabel className="text-slate-700">Órgão Competente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50">
                            <SelectValue placeholder="Selecione o órgão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Receita Federal">Receita Federal</SelectItem>
                          <SelectItem value="PGFN">PGFN</SelectItem>
                          <SelectItem value="Secretaria da Fazenda">
                            Secretaria da Fazenda
                          </SelectItem>
                          <SelectItem value="Prefeitura Municipal">Prefeitura Municipal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-slate-50/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
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
                  name="parcelasTotais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Total de Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Ex: 60"
                          className="bg-slate-50/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
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
