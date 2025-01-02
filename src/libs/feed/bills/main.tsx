import { Bill } from "@/types/bill";
import { navigationLinks } from "@/utils/nav-links";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { BillShowcase } from "./bills-showcase";

export function BillGrid({bills, state}: { bills: Bill[], state: string }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      {bills.map((bill, key) => (
        <Card key={bill.number}
              className={`${key === 0 ? 'mt-5' : 'm-0'} overflow-hidden transition-all duration-300 mx-5 hover:shadow-lg`}>
          <BillShowcase
            type={bill.type}
            number={bill.number}
            congress={bill.congress}
            originChamber={bill.originChamber}
          />

          <CardHeader className="space-y-2">
            <h3 className="text-lg font-semibold line-clamp-2">{bill.title}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center">
                <ClockIcon className="mr-1 h-3 w-3"/>
                Updated: {new Date(bill.updateDate).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3"/>
                Action: {bill.latestAction.actionDate}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              Latest action: {bill.latestAction.text}
            </p>
          </CardContent>

          <CardFooter>
            <Button
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
              View Bill Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

