'use client'

import MainNavigation from "@/libs/navigation/main";
import { BillGrid } from "@/libs/feed/bills/main";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersIcon } from "lucide-react";
import { DateTimePickerWithRange } from "@/libs/navigation/bottombar/data-picker";
import { Separator } from "@/components/ui/separator";
import LimitSelector from "@/libs/navigation/bottombar/popover-slider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useGetBills } from "@/store/bills/get";
import { BillGridSkeleton } from "@/libs/feed/bills/bills-skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endOfMonth, startOfMonth } from "date-fns";
import { PolicyFilter } from "@/libs/bills/details/policy-filter";

type BillsFeedProps = {
  state: string
}

export function BillsFeed({state}: BillsFeedProps) {
  const [limit, setLimit] = useState("1-25");
  const today = new Date()
  const firstOfMonth = startOfMonth(today)
  const endDate = today > endOfMonth(firstOfMonth) ? today : endOfMonth(firstOfMonth)

  const [date, setDate] = useState<DateRange | undefined>({
    from: firstOfMonth,
    to: endDate,
  })
  const [fromTime, setFromTime] = useState("00:00")
  const [toTime, setToTime] = useState("23:59")
  const [sort, setSort] = useState<'updateDate+asc' | 'updateDate+desc'>('updateDate+desc');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const {data, isLoadingBills, error, fetchBills} = useGetBills();

  const fetchBillsWithParams = useCallback(() => {
    const [limitStart, limitEnd] = limit.split('-').map(Number);
    const params = {
      offset: limitStart - 1,
      limit: limitEnd - limitStart + 1,
      fromDateTime: date?.from ? `${date.from.toISOString().split('T')[0]}T${fromTime}:00Z` : undefined,
      toDateTime: date?.to ? `${date.to.toISOString().split('T')[0]}T${toTime}:00Z` : undefined,
      sort,
      state,
    };
    fetchBills(params);
  }, [state, limit, date, fromTime, toTime, fetchBills, sort]);

  useEffect(() => {
    fetchBillsWithParams();
  }, [fetchBillsWithParams]);

  const policies = useMemo(() => {
    if (!data) return [];
    const policySet = new Set(data.map(bill => bill.policyName).filter(Boolean));
    return Array.from(policySet);
  }, [data]);

  const filteredBills = useMemo(() => {
    if (!data) return null;
    if (!selectedPolicy) return data;
    return data.filter(bill => bill.policyName === selectedPolicy);
  }, [data, selectedPolicy]);

  return (
    <>
      <div className='flex overflow-hidden items-center justify-between sticky top-0 bg-background z-20'>
      <div>
          <h1 className="text-2xl font-semibold p-4">Discover</h1>
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
                    setDate={setDate}
                    setFromTime={setFromTime}
                    setToTime={setToTime}
                    className=''
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sort Order</h4>
                  <Select value={sort} onValueChange={(value: 'updateDate+asc' | 'updateDate+desc') => setSort(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sort order"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updateDate+asc">Update Date (Ascending)</SelectItem>
                      <SelectItem value="updateDate+desc">Update Date (Descending)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LimitSelector limit={limit} setLimit={setLimit}/>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Separator/>
      <PolicyFilter
        policies={policies}
        selectedPolicy={selectedPolicy}
        onSelectPolicy={setSelectedPolicy}
      />
      <div className="flex-1 overflow-y-auto">
        {isLoadingBills ? (
          <BillGridSkeleton/>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : filteredBills ? (
          <BillGrid bills={filteredBills} state={state}/>
        ) : null}
      </div>
    </>
  );
}
