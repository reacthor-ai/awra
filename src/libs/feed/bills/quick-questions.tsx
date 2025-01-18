"use client"

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { quickQuestions } from "@/utils/constant";
import { useQuickAnalystMutation } from "@/store/bills/quick-analyst";

interface QuickQuestionsProps {
  userId: string;
  billUrl: string;
  billId: string;
  cboUrl: string | null;
  handleQuestionClick: (billId: string) => void;
}

export function QuickQuestions(props: QuickQuestionsProps) {
  const {
    billId,
    handleQuestionClick,
    userId,
    billUrl,
    cboUrl,
  } = props

  const [isExpanded, setIsExpanded] = useState(false)
  const [{mutate: quickAnalystMutation, isPending}] = useQuickAnalystMutation()

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={() => {
          setIsExpanded(!isExpanded)
        }}
        className="w-full justify-between text-left font-normal text-sm"
        disabled={isPending}
      >
        <span>Quick Questions</span>
        <motion.span
          animate={{rotate: isExpanded ? 180 : 0}}
          transition={{duration: 0.3}}
        >
          <ChevronDownIcon className="h-4 w-4"/>
        </motion.span>
      </Button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: 'auto'}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.3}}
            className="mt-2 grid grid-cols-1 gap-2"
          >
            {quickQuestions.map((question, index) => (
              <motion.div
                key={index}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
              >
                <Button
                  onClick={async () => {
                    handleQuestionClick(billId)
                    await quickAnalystMutation({
                      billUrl,
                      cboUrl,
                      sessionId: userId,
                      message: question
                    })
                  }}
                  variant="ghost"
                  className="w-full h-auto py-2 px-3 text-left justify-start items-start hover:bg-primary/5 hover:text-primary transition-all duration-200 ease-in-out text-xs"
                  disabled={isPending}
                >
                  <span>{question}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
