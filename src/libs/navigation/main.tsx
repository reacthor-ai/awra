'use client'

import { ReactNode } from 'react';
import DashboardProvider from './sidebar/main';
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/libs/navigation/bottombar/app-bottombar";

interface MainNavigationProps {
  title: string | null;
  children: ReactNode;
}

export default function MainNavigation({title, children}: MainNavigationProps) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return <DashboardProvider title={title ?? ''}>{children}</DashboardProvider>;
  }
  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <BottomNav title={title ?? 'Discover'}/>
      </div>
    </>
  )
}
