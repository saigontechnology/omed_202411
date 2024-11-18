"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  defaultRange?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  defaultRange = {
    from: new Date("2024-11-01"),
    to: new Date(),
  },
  onRangeChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultRange);

  // Handle date range changes
  const handleChange = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    if (onRangeChange) {
      onRangeChange(selectedRange); // Notify parent component of changes
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange} // Call handleChange when user selects a range
            numberOfMonths={2}
            fromDate={new Date("2024-01-01")}
            toDate={new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
