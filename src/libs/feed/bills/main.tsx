"use client"

import { Bill } from "@/types/bill"
import { navigationLinks } from "@/utils/nav-links"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ClockIcon, FileTextIcon } from 'lucide-react'
import { BillShowcase } from "./bills-showcase"
import { transformRoomId } from "@/utils/transformRoomId"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function BillGrid({ bills, state }: { bills: Bill[], state: string }) {
  const router = useRouter()

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mt-6">
        {bills.map((bill) => {
          const billId = transformRoomId(bill.type, bill.number)
          return (
            <Card
              key={billId}
              className="flex flex-col transition-all hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/50 rounded-lg overflow-hidden"
            >
              <BillShowcase
                type={bill.type}
                number={bill.number}
                congress={bill.congress}
                originChamber={bill.originChamber}
              />

              <CardHeader className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium">
                    {bill.type.toUpperCase()} {bill.number}
                  </Badge>
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

              <CardFooter className="p-4 pt-0">
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
                  className="w-full transition-all duration-200 ease-in-out"
                >
                  {bill.textVersionsExist ? (
                    <>
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      View Details
                    </>
                  ) : (
                    'Bill Text Not Yet Available'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

