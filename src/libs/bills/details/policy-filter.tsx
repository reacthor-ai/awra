import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PolicyFilterProps {
  policies: string[];
  selectedPolicy: string | null;
  onSelectPolicy: (policy: string | null) => void;
}

export function PolicyFilter({ policies, selectedPolicy, onSelectPolicy }: PolicyFilterProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const selectedButton = scrollAreaRef.current.querySelector(`[data-selected="true"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedPolicy]);

  return (
    <div className="w-full bg-background">
      <ScrollArea className="w-full" ref={scrollAreaRef}>
        <div className="flex space-x-2 p-2 w-max">
          <Button
            variant={selectedPolicy === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectPolicy(null)}
            data-selected={selectedPolicy === null}
          >
            All
          </Button>
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}


