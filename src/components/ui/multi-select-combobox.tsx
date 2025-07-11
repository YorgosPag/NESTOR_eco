"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "./badge"
import { ScrollArea } from "./scroll-area"
import { Input } from "./input"
import { normalizeForSearch } from "@/lib/text-utils"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    const normalizedSearch = normalizeForSearch(searchTerm)
    return options.filter((option) =>
      normalizeForSearch(option.label).includes(normalizedSearch)
    )
  }, [searchTerm, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("group flex min-h-10 w-full items-center justify-start rounded-md border border-input bg-background text-sm ring-offset-background [&:has(:focus-visible)]:outline-none [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-ring [&:has(:focus-visible)]:ring-offset-2", className)}>
            <div className="flex flex-wrap gap-1 p-2">
              {selected.length === 0 && <span className="text-muted-foreground px-1">{placeholder}</span>}
              {selected.map((value) => {
                const option = options.find((opt) => opt.value === value)
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="gap-1.5 pr-1.5"
                  >
                    {option?.label}
                    <button
                      aria-label={`Remove ${option?.label}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(value)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={() => handleUnselect(value)}
                      className="rounded-full bg-muted-foreground/20 p-0.5 text-secondary-foreground transition-colors hover:bg-muted-foreground/40"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 mr-2" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="max-h-60">
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <div
                    key={option.value}
                    className="text-sm p-2 flex items-center rounded-sm hover:bg-accent cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => {
                      if (isSelected) {
                        handleUnselect(option.value)
                      } else {
                        onChange([...selected, option.value])
                      }
                      // Clear search term and close on selection
                      setSearchTerm("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                )
              })
            ) : (
              <p className="p-2 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
