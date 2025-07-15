
"use client"

import type { MasterIntervention, CustomList, CustomListItem } from "@/types"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { EditInterventionDialog } from "./edit-intervention-dialog"
import { DeleteInterventionDialog } from "./delete-intervention-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ColumnsProps {
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

// Helper to extract the Roman numeral from the expense category string
const getRomanNumeral = (expenseCategory: string = ''): string | null => {
    const match = expenseCategory.match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
    return match ? match[1] : null;
};

export const columns = ({ customLists, customListItems }: ColumnsProps): ColumnDef<MasterIntervention>[] => [
  {
    accessorKey: "info",
    header: "Info",
    cell: ({ row }) => {
        const intervention = row.original;
        const romanNumeral = getRomanNumeral(intervention.expenseCategory);

        if (!romanNumeral) {
            return null; // Or some fallback
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help font-medium">({romanNumeral})</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">{intervention.info}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    },
  },
  {
    accessorKey: "code",
    header: "Κωδικός",
  },
  {
    accessorKey: "interventionCategory",
    header: "Κατηγορία Παρέμβασης",
    cell: ({ row }) => {
        const intervention = row.original;
        return (
            <div className="font-medium">{intervention.interventionCategory}</div>
        )
    }
  },
  {
    accessorKey: "interventionSubcategory",
    header: "Υποκατηγορία Παρέμβασης",
  },
  {
    accessorKey: "expenseCategory",
    header: "Κατηγορία Δαπάνης",
  },
  {
    accessorKey: "maxUnitPrice",
    header: "Κόστος/Μονάδα",
     cell: ({ row }) => {
      const value = row.getValue("maxUnitPrice");
      if (typeof value !== 'number') return null;

      const formatted = new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: "EUR",
      }).format(value)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const intervention = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Άνοιγμα μενού</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ενέργειες</DropdownMenuLabel>
            <EditInterventionDialog intervention={intervention} customLists={customLists} customListItems={customListItems}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="mr-2 h-4 w-4" />
                Επεξεργασία
              </DropdownMenuItem>
            </EditInterventionDialog>
            <DeleteInterventionDialog intervention={intervention}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </DropdownMenuItem>
            </DeleteInterventionDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
