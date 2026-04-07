import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Parcelamentos() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parcelamentos</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Meus Parcelamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Página de Parcelamentos em construção.</p>
        </CardContent>
      </Card>
    </div>
  )
}
