'use client'

import { MoreVertical, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRoutes } from "@/utils/api-links";
import { Message, useChat } from 'ai/react'

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import { useGetAIMessages } from "@/store/ai/messages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { USALoadingIndicator } from "@/libs/bills/details/bill-details-loading";
import BillDetailsSkeleton from "@/app/c/[state]/bill/[billNumber]/loading";

const commonQuestions = [
  {
    id: 1,
    question: "Can you summarize this bill in simple terms?",
    icon: SendHorizontal,
    description: "Get a plain-language explanation of what this bill does"
  },
  {
    id: 2,
    question: "How does this bill affect my taxes?",
    icon: SendHorizontal,
    description: "Understand the financial impact on your household"
  },
  {
    id: 3,
    question: "What are the implementation timelines?",
    icon: SendHorizontal,
    description: "Key dates and deadlines for this legislation"
  },
  {
    id: 4,
    question: "What's the cost to my state?",
    icon: SendHorizontal,
    description: "State-level budget impact and funding requirements"
  },
  {
    id: 5,
    question: "Are there any immediate actions required?",
    icon: SendHorizontal,
    description: "Steps you need to take or changes to prepare for"
  }
];

function ChatMessage({role, content}: { role: 'system' | 'user' | 'assistant' | 'data'; content: string }) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{duration: 0.3}}
      className={cn(
        "flex w-full gap-4 py-6",
        role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn(
        "h-10 w-10",
        role === 'user' ? "bg-blue-500" : "bg-green-500"
      )}>
        {role === 'user' ? (
          <AvatarFallback>U</AvatarFallback>
        ) : (
          <>
            <AvatarImage
              src={'https://www.brownstoner.com/wp-content/uploads/2024/07/uncle-sam-i-want-you-poster-library-congress-flagg-illustration-feature-3.jpg'}
              alt="Uncle Sam"/>
            <AvatarFallback>US</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className={cn(
        "flex-1 px-6 py-4 rounded-2xl shadow-lg",
        role === 'user' ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
      )}>
        {role === 'user' ? (
          <p className="text-base leading-relaxed">{content}</p>
        ) : (
          <ReactMarkdown className="text-base leading-relaxed prose prose-green max-w-none">
            {content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

function ChatContainer({messages}: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content}/>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef}/>
      </div>
    </div>
  );
}

function ChatItem({title}: { title: string }) {
  return (
    <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
      <span className="text-sm text-gray-700">{title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 text-gray-500"
      >
        <MoreVertical className="h-4 w-4"/>
      </Button>
    </div>
  );
}

function SidebarContent() {
  return (
    <div className="space-y-6 px-2">
      <div className="space-y-6">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">Today</h3>
          <div className="space-y-1">
            <ChatItem title="Recent US Congress Bill"/>
          </div>
        </div>

        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">Previous 30 Days</h3>
          <div className="space-y-1">
            <ChatItem title="Things to do in NYC"/>
            <ChatItem title="Vacation Planning Timing"/>
          </div>
        </div>
      </div>
    </div>
  );
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
    url: billUrl
  } = props
  const userId = `91-${billNumber}`
  const [messageLoader, setMessagesLoader] = useState(true)
  const [isClient, setIsClient] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      userId,
      billUrl,
      loggedIn: false,
      cboUrl
    },
  });

  const {messages: internalMessages, isLoadingAIMessages} = useGetAIMessages(userId, false)

  const syncMessages = useCallback(() => {
    if (!isLoading && (internalMessages && internalMessages?.length > 0)) {
      if (aiChatMessages.length > internalMessages.length) {
        setMessages([...aiChatMessages]);
        setMessagesLoader(false)
      } else {
        setMessages(internalMessages);
        setMessagesLoader(false)
      }
    }
    setMessagesLoader(false)
  }, [isLoading, internalMessages, aiChatMessages, setMessages]);

  useEffect(() => {
    syncMessages();
  }, [syncMessages]);

  const messages = useMemo(() => {
    return aiChatMessages;
  }, [aiChatMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isClient) return null
  if (isLoadingAIMessages) return <BillDetailsSkeleton/>

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white shadow-sm sticky top-0">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center gap-6">
              <div>
                <Badge className='mb-2 text-sm'>{policy}</Badge>
                <h1 className="text-md font-semibold">{title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {originChamberCode} {billNumber} - {originChamber} {latestAction}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden" ref={chatContainerRef}>
          {
            messageLoader ? <USALoadingIndicator/> :
              messages.length === 0 ? (
                <div className="h-full overflow-y-auto">
                  <div className="max-w-3xl mx-auto px-6 py-10">
                    <div className="space-y-10">
                      <h2 className="text-2xl font-semibold text-center mb-3">Common Questions</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {commonQuestions.map((q) => (
                          <form key={q.id} onSubmit={handleSubmit}>
                            <Button
                              variant="outline"
                              type="submit"
                              onClick={() => {
                                setInput(q.question)
                              }}
                              className="flex flex-col items-start gap-2 h-auto p-6 text-left hover:bg-gray-100 transition-colors duration-200 rounded-xl shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <q.icon className="h-5 w-5 text-blue-500"/>
                                <span className="font-medium text-md">{q.question}</span>
                              </div>
                              <span className="text-sm text-gray-600 pl-8 whitespace-pre-wrap">{q.description}</span>
                            </Button>
                          </form>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <ChatContainer messages={messages}/>
              )}
        </div>

        {/* Chat Input Form */}
        <div className="sticky bottom-14 mt-14 bg-white border-t shadow-md">
          <div className="w-full px-4 py-4 md:px-6">
            <div className="mx-auto flex flex-1 gap-4 text-base md:gap-6 md:max-w-5xl">
              <form onSubmit={handleSubmit} className="relative flex h-full max-w-full flex-1 flex-col w-full">
                <div className="flex w-full items-center">
                  <div className="w-full">
                    <div
                      className="flex w-full cursor-text flex-col rounded-2xl px-4 py-2 transition-colors bg-gray-100 focus-within:bg-white focus-within:shadow-lg">
                      <div className="flex min-h-[52px] items-center">
                        <div className="min-w-0 max-w-full flex-1">
                          <textarea
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask about this bill..."
                            className="block w-full resize-none border-0 bg-transparent px-0 py-2 text-black placeholder:text-gray-500 focus:ring-0 focus-visible:ring-0 text-base"
                            style={{height: '52px', overflowY: 'hidden'}}
                          />
                        </div>
                        <div className="ml-2">
                          <Button
                            type="submit"
                            size="icon"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 focus-visible:outline-none disabled:opacity-50 transition-colors duration-200"
                            disabled={isLoading || input.trim() === ''}
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <SendHorizontal className="h-5 w-5"/>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}