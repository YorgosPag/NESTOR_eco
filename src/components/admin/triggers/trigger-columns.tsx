"use client"

import type { Trigger, CustomList, CustomListItem } from "@/types"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu-item"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EditTriggerDialog } from "./edit-trigger-dialog"
import { DeleteTriggerDialog } from "./delete-trigger-dialog"

interface ColumnsProps {
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export const columns = ({ customLists, customListItems }: ColumnsProps): ColumnDef<Trigger>[] => [
  {
    accessorKey: "name",
    header: "Όνομα Trigger",
  },
  {
    accessorKey: "code",
    header: "Κωδικός",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.code || 'Δ/Υ'}</Badge>
    }
  },
  {
    accessorKey: "interventionCategory",
    header: "Κατηγορία Παρέμβασης",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.interventionCategory}</Badge>
    }
  },
  {
    accessorKey: "description",
    header: "Περιγραφή",
    cell: ({ row }) => {
        return <p className="text-muted-foreground max-w-sm truncate">{row.original.description || '-'}</p>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const trigger = row.original

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
            <EditTriggerDialog trigger={trigger} customLists={customLists} customListItems={customListItems}>
              <DropdownMenuItem onSelectPreventClose>
                <Pencil className="mr-2 h-4 w-4" />
                Επεξεργασία
              </DropdownMenuItem>
            </EditTriggerDialog>
            <DeleteTriggerDialog trigger={trigger}>
              <DropdownMenuItem onSelectPreventClose className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </DropdownMenuItem>
            </DeleteTriggerDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
