"use client";

import type { Contact } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditContactDialog } from "./edit-contact-dialog";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  if (contacts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Δεν βρέθηκαν επαφές.</p>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Όνομα/Εταιρεία</TableHead>
            <TableHead>Ρόλος/Ειδικότητα</TableHead>
            <TableHead>Επικοινωνία</TableHead>
            <TableHead className="hidden md:table-cell">Σημειώσεις</TableHead>
            <TableHead>
              <span className="sr-only">Ενέργειες</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={contact.avatar} alt="Avatar" />
                        <AvatarFallback>{contact.name ? contact.name.charAt(0) : 'X'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{contact.name || '[Χωρίς Όνομα]'}</div>
                        {contact.company && <div className="text-sm text-muted-foreground">{contact.company}</div>}
                    </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <Badge>{contact.role}</Badge>
                    {contact.specialty && <span className="text-xs text-muted-foreground">{contact.specialty}</span>}
                </div>
              </TableCell>
              <TableCell>
                  <div className="text-sm">{contact.email}</div>
                  {contact.phone && <div className="text-sm text-muted-foreground">{contact.phone}</div>}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">{contact.notes || '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Μενού ενεργειών</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ενέργειες</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <EditContactDialog contact={contact}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Επεξεργασία
                        </DropdownMenuItem>
                    </EditContactDialog>
                    <DeleteContactDialog contact={contact}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Διαγραφή
                        </DropdownMenuItem>
                    </DeleteContactDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
