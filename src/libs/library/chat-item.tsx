import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import type { ChatAwraUserExtend } from "@/lib/prisma"
import { navigationLinks } from "@/utils/nav-links";
import { BillType } from "@/types/bill-details";
import { getBillNumber } from "@/utils/getBillNumber";

interface ChatItemProps {
  chat: ChatAwraUserExtend
  stateId: string
}

export function ChatItem({chat, stateId}: ChatItemProps) {
  const userInitial = chat.user?.name?.[0] ||
    chat.user?.email?.[0] ||
    'U'

  const displayName = chat.user?.name ||
    chat.user?.email?.split('@')[0] ||
    'User'

  const metadata = chat.metadata as { billType: BillType, congress: string } ?? {}
  const congress = "congress" in metadata ? metadata.congress : ""
  const billType = "billType" in metadata ? metadata.billType.toUpperCase() : ""
  const billNumber = getBillNumber(chat.roomId)

  return (
    <div className="group border relative flex min-h-[116px] flex-col rounded-lg">
      <Link
        href={navigationLinks.billDetails({
          billNumber,
          stateId,
          congress,
          billType
        })}
        className="absolute inset-0 z-10 cursor-pointer overflow-hidden rounded-lg"
      >
        <span className="sr-only">View Chat</span>
      </Link>

      <div className="grid flex-1 auto-rows-min items-start gap-3 p-3 pt-3.5 text-sm">
        <div className="grid auto-rows-min items-start gap-2">
          <div className="flex max-w-[90%] items-center gap-1">
            <h3 className="whitespace-pre-wrap font-medium leading-none tracking-tight truncate">
              {chat.title}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-1">
            {chat.summary || `Discussion about Bill ${chat.roomId}`}
          </p>
        </div>
      </div>

      <Separator className="mx-3 w-auto"/>

      <div className="flex items-center p-6 h-11 gap-3 rounded-b-lg px-3 py-0">
        <div className="flex min-w-0 items-center gap-1 text-sm leading-none text-gray-500">
          <Avatar className="size-4 rounded-sm">
            <AvatarImage src={chat.user?.image || undefined} alt={displayName}/>
            <AvatarFallback className="text-[0.5rem] bg-alpha-400">
              {userInitial.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground font-medium">{displayName}</span>
          <span className="hidden truncate text-nowrap sm:inline">
            Updated {formatDistanceToNow(chat.updatedAt, {addSuffix: true})}
          </span>
          <span className="inline truncate text-nowrap sm:hidden">
            Updated {formatDistanceToNow(chat.updatedAt, {addSuffix: true})}
          </span>
        </div>
      </div>
    </div>
  )
}