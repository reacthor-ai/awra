"use client"

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { MAX_WORDS } from "@/utils/constant";

const questions = [
  "What is this bill about?",
  "What tax changes are proposed?",
  "What's the bill status?",
]

interface QuickQuestionsProps {
  billId: string;
  onQuestionClick: (billId: string, question: string) => void;
  isQuickQuestionValid: boolean;
  userId: string;
  billUrl: string;
  cboUrl: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setInput: (input: string) => void;
  isLoading: boolean;
  isAnswer: boolean;
  setUserId: any
}

export function QuickQuestions(props: QuickQuestionsProps) {
  const {
    billId,
    onQuestionClick,
    isQuickQuestionValid,
    handleSubmit,
    setInput,
    isAnswer,
    setUserId,
    userId,
    isLoading
  } = props

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={() => {
          setIsExpanded(!isExpanded)
          setUserId(userId)
        }}
        className="w-full justify-between text-left font-normal text-sm"
        disabled={isQuickQuestionValid}
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
            {questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
              >
                {
                  isAnswer ? (
                    <Button
                      onClick={() => {
                        onQuestionClick(billId, question);
                      }}
                      variant="ghost"
                      className="w-full h-auto py-2 px-3 text-left justify-start items-start hover:bg-primary/5 hover:text-primary transition-all duration-200 ease-in-out text-xs"
                      disabled={isLoading}
                    >
                      <span>{question}</span>
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <Button
                        type="submit"
                        onClick={() => {
                          setInput(question + MAX_WORDS);
                          onQuestionClick(billId, question);
                        }}
                        variant="ghost"
                        className="w-full h-auto py-2 px-3 text-left justify-start items-start hover:bg-primary/5 hover:text-primary transition-all duration-200 ease-in-out text-xs"
                        disabled={isLoading}
                      >
                        <span>{question}</span>
                      </Button>
                    </form>
                  )
                }
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
