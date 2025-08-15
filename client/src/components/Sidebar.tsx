import { Link, useLocation } from "react-router-dom"
import { 
  Shield, 
  Key, 
  FileText, 
  User, 
  CreditCard, 
  Settings, 
  Home,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar
} from "./ui/sidebar"

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Passwords', href: '/passwords', icon: Key },
  { name: 'Secure Notes', href: '/notes', icon: FileText },
  { name: 'Personal Info', href: '/personal-info', icon: User },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { state } = useSidebar()

  return (
    <SidebarPrimitive className="border-r bg-background">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          {state === "expanded" && (
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Dashway
              </h1>
              <p className="text-sm text-muted-foreground">Password Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {state === "expanded" && (
                          <>
                            <span>{item.name}</span>
                            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  )
}