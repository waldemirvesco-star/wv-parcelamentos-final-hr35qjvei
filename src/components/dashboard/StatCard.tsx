import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  theme: 'emerald' | 'slate' | 'blue' | 'amber' | 'red'
}

const themes = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  red: 'bg-red-50 text-red-600 border-red-200',
}

export function StatCard({ title, value, icon, theme }: StatCardProps) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md border-transparent shadow-sm">
      <CardContent className={cn('p-6 rounded-xl border', themes[theme])}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <div className="p-3 bg-white/60 rounded-full shadow-sm">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
