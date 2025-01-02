'use client'

import { formatDistanceToNow } from 'date-fns'
import { Lock, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatItemProps {
  chat: {
    id: string
    title: string
    preview: string
    isLocked: boolean
    updatedAt: Date
    user: {
      username: string
      avatar?: string
    }
  }
}

export function ChatItem({ chat }: ChatItemProps) {
  return (
    <div className="group relative rounded-lg p-4 transition-colors hover:bg-gray-800/50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base flex items-center gap-2 text-gray-100">
            {chat.title}
            {chat.isLocked && <Lock className="h-4 w-4 text-gray-400" />}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-300"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>Copy Link</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-400 line-clamp-1">
          {chat.preview}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Avatar className="h-5 w-5">
            <AvatarImage src={chat.user.avatar} alt={chat.user.username} />
            <AvatarFallback>{chat.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-gray-400">{chat.user.username}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400">
            Updated {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

