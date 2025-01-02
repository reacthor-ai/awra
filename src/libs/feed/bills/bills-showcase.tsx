import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BillShowcaseProps {
  type: string;
  number: string;
  congress: number;
  originChamber: string;
}

export function BillShowcase({ type, number, congress, originChamber }: BillShowcaseProps) {
  const chamberColor = originChamber === 'House' ? 'bg-blue-500' : 'bg-red-500';

  return (
    <div className="relative aspect-[16/5] overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <div className="flex flex-col items-start space-y-2">
          <Badge variant="secondary" className="bg-white text-black text-xs">
            {type} {number}
          </Badge>
          <div className="flex items-center space-x-2">
            <div className={cn("w-2 h-2 rounded-full", chamberColor)} />
            <span className="text-white text-xs font-medium">{originChamber}</span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant="secondary" className="bg-white text-black text-xs">
            Congress {congress}
          </Badge>
          <span className="text-white text-xs font-medium">{type}{number}</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
