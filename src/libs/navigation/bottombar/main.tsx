import { ReactNode } from "react";
import { BottomNav } from "./app-bottombar";

type DashboardBottomBarProps = {
  children: ReactNode
  title: string
}

export default function DashboardBottomBarProvider({children, title}: DashboardBottomBarProps) {
  return (
    <>
      {children}
      <BottomNav title={title}/>
    </>
  )
}