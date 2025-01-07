import { Bill } from "@/types/bill"
import { navigationLinks } from "@/utils/nav-links"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { BillShowcase } from "./bills-showcase"
import { transformRoomId } from "@/utils/transformRoomId"

export function BillGrid({bills, state}: { bills: Bill[], state: string }) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6 pb-20">
    {bills.map((bill) => (
        <Card
          key={transformRoomId(bill.type, bill.number)}
          className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
        >
          <BillShowcase
            type={bill.type}
            number={bill.number}
            congress={bill.congress}
            originChamber={bill.originChamber}
          />

          <CardHeader className="space-y-1.5 pt-4 pb-3">
            <h3 className="text-sm font-medium leading-tight line-clamp-2">
              {bill.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3"/>
                {new Date(bill.updateDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3"/>
                {bill.latestAction.actionDate}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {bill.latestAction.text}
            </p>
          </CardContent>

          <CardFooter className="pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(
                navigationLinks.billDetails({
                  billNumber: bill.number,
                  stateId: state,
                  congress: bill.congress.toString(),
                  billType: bill.type,
                })
              )}
              className="w-full"
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

