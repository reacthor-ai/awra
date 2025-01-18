'use client'

import { ArrowLeft, Info, SendHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiRoutes } from "@/utils/api-links"
import { useChat } from 'ai/react'
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { VoiceType } from "@/types/ai"
import { VoiceToggle } from "@/libs/bills/details/voice-toggle"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useVoicePreference } from "@/libs/bills/details/useVoicePreference"
import { Separator } from "@/components/ui/separator";
import { BillType } from "@/types/bill-details";
import { ChatContainer } from "@/libs/bills/details/chats";

const commonQuestions = [
  {
    id: 1,
    question: "Summarize this bill",
    icon: Info,
    description: "Get a plain-language explanation"
  },
  {
    id: 2,
    question: "Tax implications",
    icon: Info,
    description: "Impact on your taxes"
  },
  {
    id: 3,
    question: "State impact",
    icon: Info,
    description: "Effects on your state"
  },
  {
    id: 4,
    question: "Co Sponsors",
    icon: Info,
    description: "Who co-sponsored this bill?"
  },
]

type BillDetails = {
  title: string
  originChamberCode: string
  billNumber: string
  policy: string
  url: string
  cboUrl: string | null
  sessionId: string
  congress: number
  internalMessages: any
  state: string
  billType: BillType
  userId: string
  chatId: string | undefined
}

export function BillDetails(props: BillDetails) {
  const {
    title,
    originChamberCode,
    billNumber,
    congress,
    billType,
    policy,
    cboUrl,
    sessionId,
    userId,
    chatId,
    state,
    internalMessages,
    url: billUrl
  } = props
  const [messageLoader, setMessagesLoader] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const {voice, setVoice} = useVoicePreference(userId)
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages: aiChatMessages,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    api: apiRoutes.bills.agent,
    body: {
      sessionId,
      billUrl,
      loggedIn: false,
      cboUrl,
      voiceType: voice,
      billNumber,
      congress,
      billType,
      userId,
      chatId
    },
  })

  const syncMessages = useCallback(() => {
    if (!isLoading && (internalMessages && internalMessages?.length > 0)) {
      if (aiChatMessages.length > internalMessages.length) {
        setMessages([...aiChatMessages])
        setMessagesLoader(false)
      } else {
        setMessages(internalMessages)
        setMessagesLoader(false)
      }
    }
    setMessagesLoader(false)
  }, [isLoading, internalMessages, aiChatMessages, setMessages])

  const handleVoiceToggle = useCallback((newVoice: VoiceType) => {
    setVoice(newVoice)
  }, [setVoice])

  useEffect(() => {
    syncMessages()
  }, [syncMessages])

  const messages = useMemo(() => {
    return aiChatMessages
  }, [aiChatMessages])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!isClient) return null

  return (
    <div className="flex flex-col min-h-screen h-[100dvh] bg-background relative overflow-hidden">
      {/* Header */}
      <header
        className={cn(
          "bg-background backdrop-blur-sm",
          "sticky top-0 z-10",
          "-webkit-transform: translate3d(0,0,0)",
          "will-change-transform",
          "after:content-[''] after:absolute after:top-[-100px] after:left-0",
          "after:right-0 after:h-[100px] after:bg-white/80"
        )}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 h-auto rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6"/>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-medium mb-1.5">{title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs sm:text-sm h-6 sm:h-7 px-2">
                  {originChamberCode} {billNumber}
                </Badge>
                {policy && (
                  <Badge variant="outline" className="text-xs sm:text-sm h-6 sm:h-7 px-2">
                    {policy}
                  </Badge>
                )}
              </div>
            </div>
            <VoiceToggle voice={voice} onToggle={handleVoiceToggle}/>
          </div>
        </div>
      </header>

      <Separator/>

      <main className={cn(
        "flex-1",
        "overflow-y-auto",
        "overscroll-behavior-y-contain",
        "-webkit-overflow-scrolling: touch",
        "pb-[50px]",
        "relative"
      )} ref={chatContainerRef}>
        <div className="min-h-full">
          {messageLoader ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{rotate: 360}}
                transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                className="h-8 w-8 sm:h-10 sm:w-10 border-blue-500 rounded-full"
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-lg sm:text-xl font-medium text-center mb-6">
                  What would you like to know?
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  {commonQuestions.map((q) => (
                    <form key={q.id} onSubmit={handleSubmit}>
                      <Button
                        key={q.id}
                        variant="outline"
                        type="submit"
                        onClick={() => {
                          setInput(q.question + ": " + q.description + " My state: " + state)
                        }}
                        className="w-full flex items-center gap-3 p-4 h-auto text-left rounded-xl"
                      >
                        <q.icon className="h-5 w-5 text-blue-500 flex-shrink-0"/>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm sm:text-base">{q.question}</span>
                          <span className="text-xs sm:text-sm text-neutral-600">
                        {q.description}
                      </span>
                        </div>

                      </Button>
                    </form>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ChatContainer isLoading={isLoading} voice={voice} messages={messages}/>
          )}
        </div>
      </main>
      <Separator/>
      {/* Chat Input Form */}
      <footer className={cn(
        "bg-background backdrop-blur-sm",
        isMobile ? "pb-[env(safe-area-inset-bottom)]" : "",
        "z-50",
      )}>
        <div className="max-w-3xl mx-auto px-4 py-2 sm:px-6 sm:py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about this bill..."
          className={cn(
            "w-full resize-none rounded-xl border border-neutral-200",
            "bg-background backdrop-blur-sm px-4 py-2.5",
            "text-sm sm:text-base focus:outline-none focus:border-blue-500",
            "transition-all duration-200",
            "text-base",
            "touch-manipulation"
          )}
          rows={1}
          style={{
            minHeight: '50px',
            maxHeight: '120px',
            fontSize: '16px'
          }}
        />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 rounded-xl bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 transition-all duration-200"
              disabled={isLoading || input.trim() === ''}
            >
              {isLoading ? (
                <motion.div
                  animate={{rotate: 360}}
                  transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <SendHorizontal className="h-5 w-5"/>
              )}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  )
}

