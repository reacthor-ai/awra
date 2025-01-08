import { Sidebar as AppSidebar } from "./sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ReactNode } from 'react';

interface DashboardProps {
  title: string | null
  children: ReactNode;
}

export default function DashboardProvider({children, title}: DashboardProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        <AppSidebar title={title!}/>
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

