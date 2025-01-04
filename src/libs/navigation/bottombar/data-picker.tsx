"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

type DateTimePickerWithRangeProps = {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  fromTime: string;
  setFromTime: React.Dispatch<React.SetStateAction<string>>;
  toTime: string;
  setToTime: React.Dispatch<React.SetStateAction<string>>;
  className: string
};

export function DateTimePickerWithRange(props: DateTimePickerWithRangeProps) {
  const {
    className = '',
    date,
    setDate,
    fromTime,
    setFromTime,
    toTime,
    setToTime,
  } = props

  const formatDateTime = (date: Date | undefined, time: string) => {
    if (!date) return ""
    const [hours, minutes] = time.split(":")
    const newDate = new Date(date)
    newDate.setHours(parseInt(hours), parseInt(minutes))
    return format(newDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }

  const today = new Date()
  const disabledDays = {after: today}

  const fromDateTime = formatDateTime(date?.from, fromTime)
  const toDateTime = formatDateTime(date?.to, toTime)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4"/>
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yy")} - {format(date.to, "MMM d, yy")}
                </>
              ) : (
                format(date.from, "MMM d, yy")
              )
            ) : (
              <span>Pick dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            disabled={disabledDays}
            fromDate={addDays(today, -365)}
          />
          <div className="p-3 border-t border-border">
            <div className="flex justify-between space-x-2 mb-2">
              <div className="space-y-1 flex-1">
                <label htmlFor="fromTime" className="text-xs font-medium">From</label>
                <Input
                  id="fromTime"
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label htmlFor="toTime" className="text-xs font-medium">To</label>
                <Input
                  id="toTime"
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-medium">Range:</p>
              <p className="text-muted-foreground">{fromDateTime} - {toDateTime}</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}