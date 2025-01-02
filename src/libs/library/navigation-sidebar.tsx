'use client'

import { Book, MessageSquare, MoreVertical, Plus, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReactNode } from "react";

interface NavItem {
  title: string
  href: string
  icon: ReactNode
}

interface RecentChat {
  id: string
  title: string
}

const mainNavItems: NavItem[] = [
  {
    title: 'Library',
    href: '/library',
    icon: <Book className="h-5 w-5"/>
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: <Plus className="h-5 w-5"/>
  },
  {
    title: 'Feedback',
    href: '/feedback',
    icon: <MessageSquare className="h-5 w-5"/>
  }
]

const recentChats: RecentChat[] = [
  {id: '1', title: 'Improve chat ui'},
  {id: '2', title: 'Gumroad payment clone'},
  {id: '3', title: 'App interface design'},
  {id: '4', title: 'Onboarding process design'},
  {id: '5', title: 'Add search box React'},
  {id: '6', title: 'SaaS Pricing Calculator'},
  {id: '7', title: 'Designing pull behavior'},
  {id: '8', title: 'Loading Page Spinner'},
  {id: '9', title: 'Recreate UI Component'},
]

export function NavigationSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Book className="h-5 w-5"/>
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 text-left border-b">
          <SheetTitle className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">v0</span>
            </Link>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4"/>
              </Button>
            </SheetTrigger>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-2 p-4">
            <Button className="w-full justify-start text-left" variant="outline">
              New Chat
            </Button>

            <nav className="flex flex-col gap-2">
              {mainNavItems.map((item) => (
                <Link key={item.title} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      item.title === 'Library' && "bg-accent"
                    )}
                  >
                    {item.icon}
                    {item.title}
                    {item.title === 'Projects' && (
                      <Plus className="ml-auto h-4 w-4"/>
                    )}
                  </Button>
                </Link>
              ))}
            </nav>

            <Separator className="my-2"/>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground px-2">
                Recent Chats
              </h2>
              <nav className="flex flex-col gap-1">
                {recentChats.map((chat) => (
                  <Link key={chat.id} href={`/chat/${chat.id}`}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-2 py-1 h-auto font-normal"
                    >
                      <span className="truncate">{chat.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4"/>
                      </Button>
                    </Button>
                  </Link>
                ))}
              </nav>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground"
              >
                View All →
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

