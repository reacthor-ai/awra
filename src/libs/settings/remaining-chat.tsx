"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, ShieldAlertIcon } from 'lucide-react'

interface RemainingChatsCardProps {
  remainingChat: number | null
}

export function RemainingChatsCard({ remainingChat }: RemainingChatsCardProps) {
  if (remainingChat === null) return null

  return (
    <Card className="w-full max-w-md mx-auto bg-background">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold flex items-center justify-center space-x-2">
          <ShieldAlertIcon className="w-6 h-6 text-yellow-500" />
          <span>Remaining Chats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant="destructive" className="text-3xl px-3 py-1">
          {remainingChat} left
        </Badge>
      </CardContent>
      <CardFooter className="justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <InfoIcon className="w-4 h-4 mr-1" />
              Why does this count in private browsing?
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Chat counts are tracked server-side to ensure fair usage and prevent misuse.
                This applies even in private browsing to maintain consistency and protect our services.
                Your privacy is still protected as we don&lsquo;t store personal browsing data.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

