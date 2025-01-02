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
      <div className="flex h-screen bg-background">
        <AppSidebar/>
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            <h1 className="text-2xl font-semibold p-4">{title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

