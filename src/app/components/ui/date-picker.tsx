"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "./utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  /** Controlled value in "yyyy-MM-dd" format, matching <input type="date"> */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Bounds in "yyyy-MM-dd" format, matching <input type="date"> min/max */
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  id?: string;
  displayFormat?: string;
}

function parseISODate(value?: string): Date | undefined {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return undefined;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  min,
  max,
  disabled,
  className,
  error,
  id,
  displayFormat = "dd MMM yyyy",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISODate(value);
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 border rounded-xl text-sm text-left transition-colors focus:outline-none bg-white dark:bg-white/5 text-[#212121] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-400 dark:border-red-500/60 focus:border-red-500"
              : "border-gray-200 dark:border-white/10 focus:border-[#D32F2F]",
            className,
          )}
        >
          <span className={cn(!selected && "text-gray-400 dark:text-gray-500")}>
            {selected ? format(selected, displayFormat) : placeholder}
          </span>
          <CalendarIcon size={15} className="shrink-0 text-gray-400 dark:text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? maxDate ?? new Date()}
          onSelect={(date) => {
            if (date) onChange?.(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
