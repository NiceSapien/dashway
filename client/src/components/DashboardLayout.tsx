import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { DashboardHeader } from "./DashboardHeader"
import { SidebarProvider } from "./ui/sidebar"
import { useAuth } from "../contexts/AuthContext"
import { useEffect, useState } from "react"
import { MasterPasswordDialog } from "./MasterPasswordDialog"

export function DashboardLayout() {
  const { masterPassword } = useAuth();
  const [isMasterPasswordDialogOpen, setIsMasterPasswordDialogOpen] = useState(false);

  useEffect(() => {
    if (!masterPassword) {
      setIsMasterPasswordDialogOpen(true);
    } else {
      setIsMasterPasswordDialogOpen(false);
    }
  }, [masterPassword]);

  return (
    <SidebarProvider>
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-6 w-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <MasterPasswordDialog open={isMasterPasswordDialogOpen} onOpenChange={setIsMasterPasswordDialogOpen} />
    </SidebarProvider>
  )
}