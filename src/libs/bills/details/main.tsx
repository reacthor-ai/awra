'use client'

import { ArrowLeft, SendHorizontal, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiRoutes } from "@/utils/api-links"
import { Message, useChat } from 'ai/react'
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown'
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { VoiceType } from "@/types/ai"
import { VoiceToggle } from "@/libs/bills/details/voice-toggle"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useVoicePreference } from "@/libs/bills/details/useVoicePreference"

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
    question: "Key dates",
    icon: Info,
    description: "Implementation timeline"
  },
  {
    id: 4,
    question: "State impact",
    icon: Info,
    description: "Effects on your state"
  },
  {
    id: 5,
    question: "Required actions",
    icon: Info,
    description: "Steps you need to take"
  }
]

type ChatMessageProps = {
  role: 'system' | 'user' | 'assistant' | 'data'
  content: string
  voice: VoiceType
}

function ChatMessage({ role, content, voice }: ChatMessageProps) {
  const isAssistant = role === 'assistant' || role === 'system'
  const bgColor = isAssistant
    ? (voice === 'uncleSam' ? "bg-red-50/80" : "bg-blue-50/80")
    : "bg-neutral-50/80"
  const textColor = isAssistant
    ? (voice === 'uncleSam' ? "text-red-900" : "text-blue-900")
    : "text-neutral-900"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-3 sm:gap-4",
        role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn(
        "h-8 w-8 sm:h-10 sm:w-10",
        role === 'user' ? "bg-neutral-200" : (voice === 'uncleSam' ? "bg-red-200" : "bg-blue-200")
      )}>
        {role === 'user' ? (
          <AvatarFallback>U</AvatarFallback>
        ) : (
          <>
            <AvatarImage
              src={voice === 'uncleSam' ? '/uncle-sam-avatar.jpg' : '/analyst-avatar.jpg'}
              alt={voice === 'uncleSam' ? "Uncle Sam" : "Analyst"}
            />
            <AvatarFallback>{voice === 'uncleSam' ? "US" : "A"}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className={cn(
        "flex-1 px-4 py-3 sm:px-5 sm:py-4 rounded-xl backdrop-blur-sm",
        bgColor,
        textColor
      )}>
        {role === 'user' ? (
          <p className="text-sm sm:text-base leading-relaxed">{content}</p>
        ) : (
          <ReactMarkdown
            className={cn(
              "text-sm sm:text-base leading-relaxed prose prose-sm sm:prose-base max-w-none",
              voice === 'uncleSam' ? "prose-red" : "prose-blue"
            )}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

function ChatContainer({ messages, voice }: { messages: Message[]; voice: VoiceType }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 mb-10 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} voice={voice} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

type BillDetails = {
  title: string
  originChamber: string
  originChamberCode: string
  billNumber: string
  latestAction: string
  policy: string
  url: string
  cboUrl: string | null
  sessionId: string
  guestId: string
  internalMessages: any
}

export function BillDetails(props: BillDetails) {
  const {
    title,
    originChamber,
    originChamberCode,
    billNumber,
    latestAction,
    policy,
    cboUrl,
    sessionId,
    guestId,
    internalMessages,
    url: billUrl
  } = props
  const [messageLoader, setMessagesLoader] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { voice, setVoice } = useVoicePreference(guestId)
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
      userId: sessionId,
      billUrl,
      loggedIn: false,
      cboUrl,
      voiceType: voice
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
    <div className="min-h-screen bg-neutral-100/80 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 h-auto rounded-lg hover:bg-neutral-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-medium mb-1.5">{title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs sm:text-sm h-6 sm:h-7 px-2 hover:bg-neutral-200">
                  {originChamberCode} {billNumber}
                </Badge>
                {policy && (
                  <Badge variant="outline" className="text-xs sm:text-sm h-6 sm:h-7 px-2">
                    {policy}
                  </Badge>
                )}
              </div>
            </div>
            <VoiceToggle voice={voice} onToggle={handleVoiceToggle} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden" ref={chatContainerRef}>
        {messageLoader ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 sm:h-10 sm:w-10 border-3 border-blue-500 border-t-transparent rounded-full"
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
                  <Button
                    key={q.id}
                    variant="outline"
                    onClick={() => {
                      setInput(q.question)
                      handleSubmit(new Event('submit') as any)
                    }}
                    className="w-full flex items-center gap-3 p-4 h-auto text-left hover:bg-neutral-50 transition-all duration-200 rounded-xl"
                  >
                    <q.icon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm sm:text-base">{q.question}</span>
                      <span className="text-xs sm:text-sm text-neutral-600">
                        {q.description}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ChatContainer voice={voice} messages={messages} />
        )}
      </main>

      {/* Chat Input Form */}
      <footer className={`sticky ${isMobile ? 'bottom-14' : 'bottom-0'} bg-white/80 backdrop-blur-sm border-t border-neutral-200`}>
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about this bill..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:border-blue-500 transition-all duration-200"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
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
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  )
}

