'use client'

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersIcon } from "lucide-react";
import { DateTimePickerWithRange } from "@/libs/navigation/bottombar/data-picker";
import { Separator } from "@/components/ui/separator";
import LimitSelector from "@/libs/navigation/bottombar/popover-slider";
import { useCallback, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endOfMonth, startOfMonth } from "date-fns";
import { PolicyFilter } from "@/libs/bills/details/policy-filter";
import { BillsResponse } from "@/types/bill";
import { useRouter, useSearchParams } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";
import { BillGrid } from "@/libs/feed/bills/main";

type BillsFeedProps = {
  state: string
  initialBills: BillsResponse
}

export function BillsFeed({state, initialBills}: BillsFeedProps) {
  const router = useRouter();
  const params = useSearchParams();

  const today = new Date();
  const firstOfMonth = startOfMonth(today);
  const endDate = today > endOfMonth(firstOfMonth) ? today : endOfMonth(firstOfMonth);

  const [limit, setLimit] = useState(params.get('limit') || "1-25");
  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: params.get('fromDateTime') ? new Date(params.get('fromDateTime')!) : firstOfMonth,
    to: params.get('toDateTime') ? new Date(params.get('toDateTime')!) : endDate,
  }));
  const [fromTime, setFromTime] = useState(params.get('fromTime') || "00:00");
  const [toTime, setToTime] = useState(params.get('toTime') || "23:59");
  const [sort, setSort] = useState<'updateDate+asc' | 'updateDate+desc'>(
    (params.get('sort') as 'updateDate+asc' | 'updateDate+desc') || 'updateDate+desc'
  );
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(params.get('policy'));

  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`${navigationLinks.content({stateId: state})}?${newSearchParams.toString()}`);
  }, [router, state, params]);
  const policies = useMemo(() => {
    if (!initialBills) return [];
    const policySet = new Set(initialBills.bills?.map(bill => bill?.policyName).filter(Boolean));
    return Array.from(policySet);
  }, [initialBills]);

  const filteredBills = useMemo(() => {
    if (!initialBills?.bills) return null;
    if (!selectedPolicy) return initialBills.bills;
    return initialBills.bills?.filter(bill => bill?.policyName === selectedPolicy);
  }, [initialBills, selectedPolicy]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      updateSearchParams({
        fromDateTime: newDate.from.toISOString().split('T')[0],
        toDateTime: newDate.to.toISOString().split('T')[0]
      });
    }
  };

  const handleTimeChange = (newFromTime: string, newToTime: string) => {
    setFromTime(newFromTime);
    setToTime(newToTime);
    updateSearchParams({
      fromTime: newFromTime,
      toTime: newToTime
    });
  };

  const handleSortChange = (value: 'updateDate+asc' | 'updateDate+desc') => {
    setSort(value);
    updateSearchParams({sort: value});
  };

  const handlePolicyChange = (policy: string | null) => {
    setSelectedPolicy(policy);
    updateSearchParams({policy: policy || ''});
  };

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-semibold">List of Bills</h1>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full m-4">
                <SlidersIcon className="h-4 w-4"/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Date Range</h4>
                  <DateTimePickerWithRange
                    date={date}
                    fromTime={fromTime}
                    toTime={toTime}
                    setDate={handleDateChange}
                    setFromTime={(newFromTime) => handleTimeChange(newFromTime, toTime)}
                    setToTime={(newToTime) => handleTimeChange(fromTime, newToTime)}
                    className=''
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sort Order</h4>
                  <Select
                    value={sort}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sort order"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updateDate+asc">Update Date (Ascending)</SelectItem>
                      <SelectItem value="updateDate+desc">Update Date (Descending)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LimitSelector
                  limit={limit}
                  setLimit={(newLimit) => {
                    setLimit(newLimit);
                    updateSearchParams({limit: newLimit});
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Separator/>
      {/* Policy Filter */}
      <div className="sticky top-0 bg-background z-10 min-w-0"> {/* min-w-0 here too */}
        <PolicyFilter
          policies={policies}
          selectedPolicy={selectedPolicy}
          onSelectPolicy={handlePolicyChange}
          state={state}
        />
      </div>

      {/* Bills Grid */}
      <div className="flex-1 overflow-y-auto min-w-0"> {/* min-w-0 for grid container */}
        <div className="p-4">
          {filteredBills && <BillGrid bills={filteredBills} state={state}/>}
        </div>
      </div>
    </div>
  )
}
