import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from 'next/navigation';
import { navigationLinks } from "@/utils/nav-links";
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

type PolicyFilterProps = {
  policies: string[];
  selectedPolicy: string | null;
  onSelectPolicy: (policy: string | null) => void;
  state: string;
}

export function PolicyFilter({policies, selectedPolicy, onSelectPolicy, state}: PolicyFilterProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const selectedButton = scrollAreaRef.current.querySelector(`[data-selected="true"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
      }
    }
  }, [selectedPolicy]);

  const getMonthRanges = () => {
    const today = new Date();

    const monthPairs = [];
    for (let i = 0; i < 3; i++) {
      const laterMonth = subMonths(today, i * 2);
      const earlierMonth = subMonths(laterMonth, 1);

      monthPairs.push({
        fromDate: format(startOfMonth(earlierMonth), 'yyyy-MM-dd'),
        toDate: format(endOfMonth(laterMonth), 'yyyy-MM-dd'),
        label: `${format(earlierMonth, 'MMMM')} - ${format(laterMonth, 'MMMM yyyy')}`
      });
    }
    return monthPairs;
  };

  const handleMonthRangeSelect = (fromDate: string, toDate: string) => {
    // Construct the base URL
    let url = `${navigationLinks.content({stateId: state})}?`;

    // Add date range parameters without time
    url += `fromDateTime=${fromDate}`;
    url += `&toDateTime=${toDate}`;

    // Add other parameters from existing URL
    const existingParams = new URLSearchParams(params);
    existingParams.delete('policy')
    onSelectPolicy(null)
    if (existingParams.has('limit')) {
      url += `&limit=${existingParams.get('limit')}`;
    }
    if (existingParams.has('sort')) {
      url += `&sort=${existingParams.get('sort')}`;
    }

    router.push(url);
  };

  const monthRanges = getMonthRanges();
  const currentFromDate = params.get('fromDateTime');

  return (
    <div className="w-full bg-background">
      <ScrollArea className="w-full max-w-[100vw]" ref={scrollAreaRef}>
        <div className="flex space-x-2 p-2 w-max">
          <Button
            variant={selectedPolicy === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectPolicy(null)}
            data-selected={selectedPolicy === null}
          >
            All
          </Button>
          {/* Month range filters */}
          <div className="border-r pr-2 flex space-x-2">
            {monthRanges.map((range, index) => (
              <Button
                key={range.fromDate}
                variant={currentFromDate === range.fromDate ? "default" : "outline"}
                size="sm"
                onClick={() => handleMonthRangeSelect(range.fromDate, range.toDate)}
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Policy filters */}
          {policies.map((policy) => (
            <Button
              key={policy}
              variant={selectedPolicy === policy ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectPolicy(policy)}
              data-selected={selectedPolicy === policy}
            >
              {policy}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>
    </div>
  );
}