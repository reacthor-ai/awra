import Link from "next/link"
import * as React from "react";
import { createElement, useState } from "react";
import { navItems, useNavigate } from "@/libs/navigation/nav-items";
import { motion } from 'framer-motion';
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SidebarProps = {
  title: string
}

export function Sidebar({title}: SidebarProps) {
  const [active, setActive] = useState(title.toLowerCase())
  const {setTheme} = useTheme()
  const navigate = useNavigate();

  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div>
          <div className='mb-4'>
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Explore
            </h2>
          </div>
          <nav className="space-y-1">
            {navItems.map((nav) => {
              return (
                <Link
                  key={nav.id}
                  href={navigate(nav.id)}
                  onClick={() => {
                    setActive(nav.id);
                  }}
                  className={`${
                    active === nav.id ? 'bg-secondary' : ''
                  } flex items-center gap-3 rounded-lg px-4 py-2 text-secondary-foreground`}
                >
                  {createElement(nav.icon, {
                    className: `h-5 w-5 ${
                      active === nav.id ? 'text-primary' : 'text-muted-foreground'
                    }`,
                  })}
                  {nav.label}
                  {nav.id === 'live-house' && (
                    <motion.div
                      className="ml-1 h-2 w-2 rounded-full bg-red-500"
                      animate={{scale: [1, 1.5, 1]}}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
            <Moon
              className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}
