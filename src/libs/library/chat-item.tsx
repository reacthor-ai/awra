import { formatDistanceToNow } from 'date-fns'
import { Lock, MoreVertical, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
    <Card className="group transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-base flex items-center gap-2">
              {chat.title}
              {chat.isLocked && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>Copy Link</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {chat.preview}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={chat.user.avatar} alt={chat.user.username} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {chat.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{chat.user.username}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>
            Updated {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}