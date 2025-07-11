"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"
import { normalizeForSearch } from "@/lib/text-utils"

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  children?: React.ReactNode;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  children,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    const normalizedSearchTerm = normalizeForSearch(searchTerm);
    return options.filter((option) =>
      normalizeForSearch(option.label).includes(normalizedSearchTerm)
    );
  }, [searchTerm, options]);

  const selectedLabel = value ? options.find((option) => option.value === value)?.label : placeholder;

  return (
    <Popover open={open} onOpenChange={!disabled ? setOpen : () => {}}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
            aria-label="Search options"
          />
        </div>
        <ScrollArea className="max-h-60">
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="text-sm p-2 flex items-center rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onValueChange(option.value === value ? "" : option.value)
                    setOpen(false)
                    setSearchTerm("")
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))
            ) : (
              <p className="p-2 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            )}
            {children}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
