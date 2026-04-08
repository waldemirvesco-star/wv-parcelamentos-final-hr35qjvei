import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, PieChart, Settings, Users, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Novo Parcelamento', href: '/novo-parcelamento', icon: PlusCircle },
    { name: 'Parcelamentos', href: '/parcelamentos', icon: FileText },
    { name: 'Relatórios', href: '/relatorios', icon: PieChart },
    ...(user?.role === 'Admin' ? [{ name: 'Usuários', href: '/admin/users', icon: Users }] : []),
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  return (
    <Sidebar className="border-r border-slate-200 bg-white/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 w-full px-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">WV Parcelamentos</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (location.pathname.startsWith('/parcelamento/') && item.href === '/parcelamentos')

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      'mb-1 transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
