import { memo, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"
import { Message } from 'ai/react'
import { VoiceType } from "@/types/ai"
import remarkGfm from 'remark-gfm'
import { ChatContentMarkdown } from "@/components/ui/chat-content-markdown";

const ThinkingIndicator = memo(() => {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-4 rounded-xl bg-background shadow-sm w-fit"
    >
      <span className="text-sm sm:text-base text-foreground font-medium">Thinking</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  )
})

ThinkingIndicator.displayName = 'ThinkingIndicator'

const ChatMessage = memo(({role, content, voice}: {
  role: 'system' | 'user' | 'assistant' | 'data'
  content: string
  voice: VoiceType
}) => {
  const isAssistant = role === 'assistant' || role === 'system'

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -10}}
      transition={{duration: 0.3, ease: "easeOut"}}
      className={cn(
        "flex w-full gap-3 sm:gap-4",
        role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn(
        "h-8 w-8 sm:h-10 sm:w-10",
        role === 'user' ? "bg-secondary" : "bg-primary"
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
        "flex-1 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-background",
        "border border-border",
        "shadow-sm",
        "relative",
        role === 'user' ? "text-foreground" : "text-foreground",
        role === 'user' ? "chat-bubble-user" : "chat-bubble-assistant"
      )}>
        {role === 'user' ? (
          <p className="text-sm sm:text-base leading-relaxed">{content}</p>
        ) : (
         <ChatContentMarkdown content={content} />
        )}
      </div>
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'

const ChatContainer = memo((props: {
  messages: Message[]
  voice: VoiceType
  isLoading: boolean
}) => {
  const {
    messages,
    voice,
    isLoading
  } = props;

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }, [messages])

  const bubbleStyles = `
  .chat-bubble-assistant::before,
  .chat-bubble-user::before {
    content: '';
    position: absolute;
    bottom: 0;
    height: 20px;
    width: 20px;
    background-color: inherit;
    border: inherit;
    border-top: 0;
    border-left: 0;
  }

  .chat-bubble-assistant::before {
    left: -10px;
    border-bottom-right-radius: 16px;
    transform: translateY(50%) skew(15deg);
  }

  .chat-bubble-user::before {
    right: -10px;
    border-bottom-left-radius: 16px;
    transform: translateY(50%) skew(-15deg);
  }
`

  return (
    <>
      <style>{bubbleStyles}</style>
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                voice={voice}
              />
            ))}
            {isLoading && (
              <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                transition={{duration: 0.3, ease: "easeOut"}}
                className="flex w-full gap-3 sm:gap-4"
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-primary">
                  <AvatarImage
                    src={voice === 'uncleSam' ? '/uncle-sam-avatar.jpg' : '/analyst-avatar.jpg'}
                    alt={voice === 'uncleSam' ? "Uncle Sam" : "Analyst"}
                  />
                  <AvatarFallback>{voice === 'uncleSam' ? "US" : "A"}</AvatarFallback>
                </Avatar>
                <ThinkingIndicator/>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef}/>
        </div>
      </div>
    </>
  )
})

ChatContainer.displayName = 'ChatContainer'

export { ChatContainer, ChatMessage, ThinkingIndicator }

