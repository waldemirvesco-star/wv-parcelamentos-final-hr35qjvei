import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function Configuracoes() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Configurações Salvas',
      description: 'Suas preferências foram atualizadas com sucesso.',
    })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
        <p className="text-slate-500 mt-1">Gerencie as preferências da sua conta e notificações.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Escolha como deseja ser avisado sobre seus parcelamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Alertas de Vencimento</Label>
              <p className="text-sm text-slate-500">
                Receba avisos quando um parcelamento estiver próximo de vencer.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Resumo Semanal</Label>
              <p className="text-sm text-slate-500">
                Receba um e-mail semanal com o resumo de envios e pendências.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Alteração de Status</Label>
              <p className="text-sm text-slate-500">
                Notifique-me quando o status de um processo for alterado.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
