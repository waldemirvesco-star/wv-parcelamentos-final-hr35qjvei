import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Configuracoes() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Página de Configurações em construção.</p>
        </CardContent>
      </Card>
    </div>
  )
}
