"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator";
import { CongressData } from "@/types/feed";

type LiveHouseProps = CongressData

export function LiveHouse({currentState, schedule}: LiveHouseProps) {
  const recentDate = schedule[0].lastModified
  const dateStatus = schedule[0].dateStatus

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-foreground/90">House</h1>
        </div>
      </header>

      <Separator/>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6 overflow-auto md:h-screen pr-4">
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-background pb-2">
                  <CardTitle className="text-lg font-medium">Current State of Congress</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{currentState.congress}th Congress</h3>
                      <p className="text-sm py-2 text-muted-foreground">Last Session, {recentDate}.</p>
                    </div>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {currentState.status}
                    </Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Votes</h4>
                      <p className="text-sm">
                        {currentState.votesToday.completed} completed, {currentState.votesToday.scheduled} scheduled
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">Members Present</h4>
                      <p className="text-sm">
                        {currentState.membersPresent} / {currentState.totalMembers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="w-full">
              <motion.div
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.5, delay: 0.2}}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">Current Debate</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Floor
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{currentState.currentDebate}</p>
                    <p className="text-xs text-muted-foreground">Last updated: {schedule[0].lastModified}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

          </div>
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5, delay: 0.2}}
            className='mb-10'
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">{dateStatus} Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[440px] md:h-[calc(100vh-200px)]">
                  {schedule.map((event, index) => (
                    <div key={index} className="mb-4 flex items-start last:mb-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {event.time.split(' ')[0]}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

