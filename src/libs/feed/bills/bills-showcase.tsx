import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BillShowcaseProps {
  type: string
  number: string
  congress: number
  originChamber: string
}

export function BillShowcase({ type, number, congress, originChamber }: BillShowcaseProps) {
  const chamberColor = originChamber === 'House' ? 'bg-blue-500/20' : 'bg-red-500/20'
  const chamberTextColor = originChamber === 'House' ? 'text-blue-500' : 'text-red-500'

  return (
    <div className="relative h-12 overflow-hidden rounded-t-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="h-6 px-2 text-xs font-medium">
            {type} {number}
          </Badge>
          <div className={cn("px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5", chamberColor, chamberTextColor)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", originChamber === 'House' ? 'bg-blue-500' : 'bg-red-500')} />
            {originChamber}
          </div>
        </div>
        <Badge variant="outline" className="h-6 px-2 text-xs">
          Congress {congress}
        </Badge>
      </div>
    </div>
  )
}