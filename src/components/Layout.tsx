import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PieChart,
  Settings,
  Bell,
  User,
  LogOut,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Parcelamentos', href: '#', icon: FileText },
    { name: 'Relatórios', href: '#', icon: PieChart },
    ...(user?.role === 'Admin' ? [{ name: 'Usuários', href: '/admin/users', icon: Users }] : []),
    { name: 'Configurações', href: '#', icon: Settings },
  ]

  return (
    <Sidebar className="border-r border-slate-200 bg-white/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 w-full px-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">TaxFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (location.pathname.startsWith('/novo') && item.href === '/dashboard') ||
                (location.pathname.startsWith('/parcelamento') && item.href === '/dashboard')
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      'mb-1',
                      isActive &&
                        'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800',
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

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 font-sans">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200 p-4 h-16 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:bg-slate-100" />
              <h2 className="font-semibold text-slate-800 hidden sm:block">
                Gestão de Parcelamentos
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-500 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </Button>
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="flex items-center gap-2 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${user?.id}`}
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-slate-700 leading-none">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="text-xs text-slate-500">{user?.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
                className="text-slate-500"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-8 overflow-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
