'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, FileText } from 'lucide-react'
import { motion } from "framer-motion"
import Image from "next/image"
import { NoiseGradient } from "./gradient"
import { Logo } from "./logo"
import { signIn } from "next-auth/react"
import { navigationLinks } from "@/utils/nav-links";
import { useRouter } from "next/navigation";

const fadeIn = {
  initial: {opacity: 0, y: 20},
  animate: {opacity: 1, y: 0},
  transition: {duration: 0.6, ease: [0.22, 1, 0.36, 1]}
}

const scaleIn = {
  initial: {opacity: 0, scale: 0.9},
  animate: {opacity: 1, scale: 1},
  transition: {duration: 0.5, ease: [0.22, 1, 0.36, 1]}
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const AnimatedButton = motion(Button)

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="h-screen relative flex flex-col overflow-hidden">
      <NoiseGradient/>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-6">
        <motion.div
          className="text-center mb-8"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="mb-6 flex justify-center">
            <Logo />
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-white"
            variants={fadeIn}
          >
            Complex Legislation, Crystal Clear Insights
          </motion.h1>
          <motion.p
            className="text-sm md:text-base text-gray-400 max-w-xl mx-auto mb-6"
            variants={fadeIn}
          >
            From dense legal text to actionable knowledge. Navigate policy changes that affect your world.
          </motion.p>
          <motion.div variants={fadeIn}>
            <AnimatedButton
              size="sm"
              className="bg-white text-black hover:bg-gray-200"
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
              transition={{type: "spring", stiffness: 400, damping: 17}}
              onClick={() => {
                router.push(navigationLinks.login())
              }}
            >
              Analyze Your First Bill
            </AnimatedButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div variants={scaleIn}>
              <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 text-white h-full">
                <CardHeader className="p-4">
                  <motion.div
                    className="size-8 rounded-lg bg-white/10 flex items-center justify-center mb-2"
                    whileHover={{scale: 1.1}}
                    transition={{type: "spring", stiffness: 400, damping: 17}}
                  >
                    <FileText className="size-4 text-white"/>
                  </motion.div>
                  <CardTitle className="text-base md:text-lg mb-1">Instant Bill Analysis</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-gray-400">
                    Legislation decoded in seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <p className="text-gray-300 text-xs md:text-sm">
                    Transform complex bills into clear, actionable insights. Share key findings instantly on X to drive meaningful discussions.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 text-white h-full">
                <CardHeader className="p-4">
                  <motion.div
                    className="size-8 rounded-lg bg-white/10 flex items-center justify-center mb-2"
                    whileHover={{scale: 1.1}}
                    transition={{type: "spring", stiffness: 400, damping: 17}}
                  >
                    <Bot className="size-4 text-white"/>
                  </motion.div>
                  <CardTitle className="text-base md:text-lg mb-1">Power Your Voice</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-gray-400">
                    Shape the conversation on X
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <p className="text-gray-300 text-xs md:text-sm">
                    Voice your concerns about legislation through Awra. We&lsquo;ll help craft and share your perspective with Congress on X.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

