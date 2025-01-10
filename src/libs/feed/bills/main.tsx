"use client"

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { BillModified } from "@/types/bill"
import { navigationLinks } from "@/utils/nav-links"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ClockIcon, FileTextIcon, Loader2Icon, RotateCcwIcon } from 'lucide-react'
import { BillShowcase } from "./bills-showcase"
import { transformRoomId } from "@/utils/transformRoomId"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatePresence, motion } from "framer-motion"
import { QuickQuestions } from "./quick-questions"
import { Message, useChat } from "ai/react"
import { apiRoutes } from "@/utils/api-links"
import { useGetAIMessages } from "@/store/ai/messages";
import { MAX_WORDS } from "@/utils/constant";
import { Separator } from "@/components/ui/separator";

interface CardHeights {
  [key: string]: number;
}

export function BillGridComponent({bills, state}: { bills: BillModified[], state: string }) {
  const router = useRouter()
  const [cardHeights, setCardHeights] = useState<CardHeights>({})
  const [flippedBillId, setFlippedBillId] = useState<string | null>(null)
  const frontCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [userId, setUserId] = useState<string>('')
  const [billUrl, setBillUrls] = useState<string>('')
  const [cboUrl, setCboUrls] = useState<string | null>(null)
  const [currentBillId, setCurrentBillId] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null);
  const [q, setQuestion] = useState<string | null>(null)
  const {isLoadingAIMessages, messages, refetchAIMessages} = useGetAIMessages(userId, false)

  const {
    handleSubmit,
    setInput,
    setMessages,
    messages: aiChatMessages,
    isLoading
  } = useChat({
    api: apiRoutes.bills.agent,
    body: {
      userId,
      billUrl,
      loggedIn: false,
      cboUrl,
      voiceType: 'analyst'
    },
  })

  const resetCardState = useCallback(() => {
    setMessages([])
    setAnswer(null)
    setQuestion(null)
    setUserId('')
    setCurrentBillId(null)
    setBillUrls('')
    setCboUrls(null)
  }, [setMessages])

  const updateCardHeight = (billId: string) => {
    const frontCard = frontCardRefs.current[billId]
    if (frontCard) {
      const height = frontCard.offsetHeight
      setCardHeights(prev => ({
        ...prev,
        [billId]: height
      }))
    }
  }

  useEffect(() => {
    const updateAllHeights = () => {
      bills.forEach(bill => {
        const billId = transformRoomId(bill.type, bill.number)
        updateCardHeight(billId)
      })
    }

    updateAllHeights()
    window.addEventListener('resize', updateAllHeights)
    return () => window.removeEventListener('resize', updateAllHeights)
  }, [bills])

  const getAnswer = useCallback((question: string | null, chatMessages: Message[] | undefined) => {
    if (!chatMessages) return null

    if (chatMessages.length <= 0 || !question) {
      setAnswer(null)
    }

    const currentQuestion = question + MAX_WORDS
    const questionIdx = chatMessages.findIndex((currMessage) =>
      currMessage.role === "user" && currMessage.content === currentQuestion
    )

    // if we find the message, the next one must be an answer.
    if (questionIdx !== -1) {
      setAnswer(chatMessages[questionIdx + 1].content)
    }

  }, [messages, userId, q, currentBillId, resetCardState])

  useEffect(() => {
    getAnswer(q, messages)
  }, [getAnswer])

  const handleQuestionClick = async (billId: string, question: string) => {
    // If there's a different card already flipped, reset its state
    if (flippedBillId && flippedBillId !== billId) {
      resetCardState()
    }

    updateCardHeight(billId)
    setFlippedBillId(billId)
    setCurrentBillId(billId)

    const bill = bills.find(b => transformRoomId(b.type, b.number) === billId)
    if (bill) {
      setUserId(bill.sessionId)
      setBillUrls(bill.billUrl || '')
      setCboUrls(bill.cboUrl || null)
      setQuestion(question)
    }
  }

  const handleCardFlipBack = useCallback((billId: string) => {
    setFlippedBillId(null)
    resetCardState()
  }, [resetCardState])

  return (
    <div className="w-full h-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mt-6">
        {bills.map((bill) => {
          const billId = transformRoomId(bill.type, bill.number)
          const isFlipped = flippedBillId === billId
          const isCurrentBillLoading = isLoading && currentBillId === billId

          return (
            <div key={billId} className="perspective-1000 relative z-0 [&:has(>div.flipped)]:z-10">
              <motion.div
                animate={{rotateY: isFlipped ? 180 : 0}}
                transition={{duration: 0.6}}
                style={{transformStyle: 'preserve-3d'}}
                className={`relative ${isFlipped ? 'flipped' : ''}`}
              >
                {/* Front of card */}
                <motion.div
                  ref={el => frontCardRefs.current[billId] = el as any}
                  className={`w-full ${isFlipped ? 'backface-hidden' : ''}`}
                  onAnimationComplete={() => updateCardHeight(billId)}
                >
                  <Card
                    className="flex flex-col transition-all duration-300 hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/50 rounded-lg overflow-hidden">
                    <BillShowcase
                      type={bill.type}
                      number={bill.number}
                      congress={bill.congress}
                      originChamber={bill.originChamber}
                    />
                    <Separator className="mx-5 w-auto"/>
                    <CardHeader className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground">
                                {bill.congress}th Congress
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Congressional session</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                        {bill.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-grow p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {bill.latestAction.text}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 min-w-0">
                          <ClockIcon className="h-3 w-3 shrink-0"/>
                          <span className="truncate">
                            {new Date(bill.updateDate).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 min-w-0">
                          <CalendarIcon className="h-3 w-3 shrink-0"/>
                          <span className="truncate">
                            {bill.latestAction.actionDate}
                          </span>
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex flex-col gap-4">
                      <QuickQuestions
                        billId={billId}
                        onQuestionClick={handleQuestionClick}
                        isQuickQuestionValid={!bill.textVersionsExist}
                        userId={bill.sessionId}
                        billUrl={bill.billUrl || ''}
                        cboUrl={bill.cboUrl || null}
                        handleSubmit={handleSubmit}
                        setInput={setInput}
                        isLoading={isLoading}
                        setUserId={setUserId}
                        isAnswer={!!answer}
                      />
                      <Button
                        variant={bill.textVersionsExist ? "default" : "secondary"}
                        size="sm"
                        disabled={!bill.textVersionsExist}
                        onClick={() => router.push(
                          navigationLinks.billDetails({
                            billNumber: bill.number,
                            stateId: state,
                            congress: bill.congress.toString(),
                            billType: bill.type,
                          })
                        )}
                        className="w-full transition-all duration-200 ease-in-out hover:scale-105"
                      >
                        {bill.textVersionsExist ? (
                          <>
                            <FileTextIcon className="w-4 h-4 mr-2"/>
                            View Details
                          </>
                        ) : (
                          'Bill Text Not Yet Available'
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <Card
                  className={`absolute inset-0 w-full flex flex-col transition-all duration-300 hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/50 rounded-lg overflow-hidden ${
                    !isFlipped ? 'backface-hidden' : ''
                  }`}
                  style={{
                    transform: 'rotateY(180deg)',
                    height: '45vh'
                  }}
                >
                  <CardContent className="flex-grow p-6 flex flex-col justify-center items-center">
                    <AnimatePresence mode="wait">
                      {isCurrentBillLoading ? (
                        <motion.div
                          key="loading"
                          initial={{opacity: 0, scale: 0.8}}
                          animate={{opacity: 1, scale: 1}}
                          exit={{opacity: 0, scale: 0.8}}
                          className="flex flex-col items-center gap-4"
                        >
                          <Loader2Icon className="h-8 w-8 animate-spin text-primary"/>
                          <p className="text-sm text-muted-foreground">Searching for answer...</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="content"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          className="flex flex-col items-center"
                        >
                          {aiChatMessages.length > 0 ? (
                            <div className="text-lg font-medium mb-4 text-center overflow-y-auto max-h-[30vh]">
                              {aiChatMessages[aiChatMessages.length - 1].content}
                            </div>
                          ) : (
                            <div className="text-lg font-medium mb-4 text-center overflow-y-auto max-h-[30vh]">
                              {
                                (billId === currentBillId && answer) ? answer : "No response yet"
                              }
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCardFlipBack(billId)}
                      className="mt-4"
                    >
                      <RotateCcwIcon className="w-4 h-4 mr-2"/>
                      Back to Bill
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const BillGrid = memo(BillGridComponent, (prevProps, nextProps) => {
  const billsEqual = prevProps.bills.length === nextProps.bills.length &&
    prevProps.bills.every((bill, index) => {
      const prevBill = prevProps.bills[index]
      const nextBill = nextProps.bills[index]
      return (
        prevBill.type === nextBill.type &&
        prevBill.number === nextBill.number &&
        prevBill.congress === nextBill.congress &&
        prevBill.title === nextBill.title &&
        prevBill.updateDate === nextBill.updateDate &&
        prevBill.sessionId === nextBill.sessionId &&
        prevBill.billUrl === nextBill.billUrl
      )
    })

  return billsEqual && prevProps.state === nextProps.state
})