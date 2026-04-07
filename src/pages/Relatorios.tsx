import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Relatorios() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerenciais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Página de Relatórios em construção.</p>
        </CardContent>
      </Card>
    </div>
  )
}
