import { Link } from 'react-router-dom'
import { CheckCircle, Archive, Send, AlertCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/StatCard'
import { InstallmentTable } from '@/components/dashboard/InstallmentTable'
import useInstallmentStore from '@/stores/useInstallmentStore'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { installments, removeInstallment } = useInstallmentStore()
  const { toast } = useToast()

  const stats = {
    ativos: installments.filter((i) => i.status === 'Ativo').length,
    encerrados: installments.filter((i) => i.status === 'Encerrado').length,
    enviados: installments.filter((i) => i.status === 'Enviado').length,
    pendentes: installments.filter((i) => i.status === 'Pendente').length,
  }

  const handleDelete = (id: string) => {
    removeInstallment(id)
    toast({
      title: 'Parcelamento excluído',
      description: 'O registro foi removido com sucesso.',
      variant: 'default',
    })
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral dos processos e tributos da empresa.</p>
        </div>
        <Link to="/novo">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow">
            <Plus className="mr-2 h-4 w-4" />
            Novo Parcelamento
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Parcelamentos Ativos"
          value={stats.ativos}
          icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
          theme="emerald"
        />
        <StatCard
          title="Parcelamentos Encerrados"
          value={stats.encerrados}
          icon={<Archive className="h-6 w-6 text-slate-600" />}
          theme="slate"
        />
        <StatCard
          title="Enviados no Mês"
          value={stats.enviados}
          icon={<Send className="h-6 w-6 text-blue-600" />}
          theme="blue"
        />
        <StatCard
          title="Pendentes de Envio"
          value={stats.pendentes}
          icon={<AlertCircle className="h-6 w-6 text-amber-600" />}
          theme="amber"
        />
      </div>

      <div className="animate-slide-up">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Lista de Parcelamentos</h2>
        </div>
        <InstallmentTable data={installments} onDelete={handleDelete} />
      </div>
    </div>
  )
}
