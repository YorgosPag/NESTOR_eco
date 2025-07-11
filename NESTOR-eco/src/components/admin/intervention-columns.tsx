
"use client"

import type { MasterIntervention } from "@/types"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { EditInterventionDialog } from "./edit-intervention-dialog"
import { DeleteInterventionDialog } from "./delete-intervention-dialog"


export const columns: ColumnDef<MasterIntervention>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "interventionCategory",
    header: "Κατηγορία Παρέμβασης",
    cell: ({ row }) => {
        const intervention = row.original;
        return (
            <div>
                <div className="font-medium">{intervention.interventionCategory}</div>
                {intervention.interventionSubcategory && (
                    <div className="text-xs text-muted-foreground">{intervention.interventionSubcategory}</div>
                )}
            </div>
        )
    }
  },
  {
    accessorKey: "expenseCategory",
    header: "Κατηγορία Δαπάνης",
  },
  {
    accessorKey: "maxUnitPrice",
    header: "Κόστος/Μονάδα",
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("maxUnitPrice"))
      const formatted = new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: "EUR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted} / {row.original.unit.split('/')[1]}</div>
    },
  },
   {
    accessorKey: "maxAmount",
    header: "Μέγ. Δαπάνη",
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("maxAmount"))
      const formatted = new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: "EUR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
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
            <EditInterventionDialog intervention={intervention}>
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
