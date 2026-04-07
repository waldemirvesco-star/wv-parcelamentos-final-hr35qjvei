import { Outlet, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { NotificationCenter } from '@/components/NotificationCenter'
import { AppSidebar } from '@/components/app-sidebar'

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
              <NotificationCenter />
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
