import { useEffect, useState, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUserParcelamentos } from '@/services/parcelamentos'
import { getUserNotificacoesLidas, markAllNotificacoesAsRead } from '@/services/notificacoes'
import { cn } from '@/lib/utils'

type AlertType = 'Vencido' | 'Proximo'

interface Alert {
  id: string
  parcelamento_id: string
  empresa_nome: string
  tipo: AlertType
  faltam?: number
  date: string
}

export function NotificationCenter() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [open, setOpen] = useState(false)
  const [marking, setMarking] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const [parcelamentos, lidas] = await Promise.all([
        getUserParcelamentos(user.id),
        getUserNotificacoesLidas(user.id),
      ])

      const readSet = new Set(lidas.map((l) => `${l.parcelamento_id}-${l.tipo_alerta}`))
      const newAlerts: Alert[] = []

      parcelamentos.forEach((p) => {
        const q = p.quantidade_parcelas
        const a = p.parcela_atual

        if (typeof q === 'number' && typeof a === 'number' && q > 0) {
          if (a >= q) {
            if (!readSet.has(`${p.id}-Vencido`)) {
              newAlerts.push({
                id: `${p.id}-Vencido`,
                parcelamento_id: p.id,
                empresa_nome: p.empresa_nome,
                tipo: 'Vencido',
                date: p.updated || p.created,
              })
            }
          } else {
            const diff = q - a
            if (diff <= 2 && diff > 0) {
              if (!readSet.has(`${p.id}-Proximo`)) {
                newAlerts.push({
                  id: `${p.id}-Proximo`,
                  parcelamento_id: p.id,
                  empresa_nome: p.empresa_nome,
                  tipo: 'Proximo',
                  faltam: diff,
                  date: p.updated || p.created,
                })
              }
            }
          }
        }
      })

      setAlerts(newAlerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('parcelamentos', fetchData)
  useRealtime('notificacoes_lidas', fetchData)

  const handleMarkAllAsRead = async () => {
    if (!user || alerts.length === 0) return
    setMarking(true)
    await markAllNotificacoesAsRead(user.id, alerts)
    setMarking(false)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 relative hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_0_2px_white] animate-in zoom-in">
              {alerts.length > 99 ? '99+' : alerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-lg border-slate-100" align="end" sideOffset={8}>
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-md">
            <span className="font-semibold text-slate-800">Notificações</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {alerts.length} {alerts.length === 1 ? 'nova' : 'novas'}
            </span>
          </div>
          <ScrollArea className="max-h-[300px]">
            {alerts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500 animate-in fade-in">
                <CheckCheck className="h-8 w-8 text-slate-300" />
                <span className="text-sm">Nenhuma notificação no momento</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-top-1"
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'mt-1 h-2 w-2 rounded-full flex-shrink-0',
                          alert.tipo === 'Vencido' ? 'bg-red-500' : 'bg-amber-500',
                        )}
                      />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-slate-800 leading-snug">
                          {alert.tipo === 'Vencido'
                            ? `Parcelamento Vencido: ${alert.empresa_nome}`
                            : `Vencimento Próximo: ${alert.empresa_nome} (Faltam ${alert.faltam} ${alert.faltam === 1 ? 'parcela' : 'parcelas'})`}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(alert.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {alerts.length > 0 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-md">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={handleMarkAllAsRead}
                disabled={marking}
              >
                {marking ? 'Marcando...' : 'Marcar todas como lidas'}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
