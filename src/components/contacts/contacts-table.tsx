
"use client";

import { useMemo, useState } from "react";
import type { Contact, CustomList, CustomListItem } from "@/types";
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
import { MoreHorizontal, Pencil, Trash2, Search, BookUser } from "lucide-react";
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
import { Input } from "../ui/input";
import { normalizeForSearch } from "@/lib/text-utils";

interface ContactsTableProps {
  contacts: Contact[];
  customLists: CustomList[];
  customListItems: CustomListItem[];
}

export function ContactsTable({ contacts, customLists, customListItems }: ContactsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = useMemo(() => {
        if (!searchTerm.trim()) {
            return contacts;
        }
        
        const normalizedFilter = normalizeForSearch(searchTerm);
        
        return contacts.filter(contact => {
            const contactHaystack = [
                contact.firstName,
                contact.lastName,
                contact.company,
                contact.email,
                contact.role,
                contact.specialty
            ].filter(Boolean).join(' '); // Combine fields
            
            const normalizedContactHaystack = normalizeForSearch(contactHaystack);
            
            return normalizedContactHaystack.includes(normalizedFilter);
        });
    }, [contacts, searchTerm]);


  if (contacts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Δεν βρέθηκαν επαφές.</p>;
  }

  return (
    <>
    <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Αναζήτηση επαφής..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            />
        </div>
    </div>
    {filteredContacts.length > 0 ? (
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
            {filteredContacts.map((contact) => {
                const fullAddress = [
                    contact.addressStreet,
                    contact.addressNumber,
                    contact.addressArea,
                    contact.addressPostalCode,
                    contact.addressCity,
                    contact.addressPrefecture,
                ].filter(Boolean).join(", ");
                
                return (
                    <TableRow key={contact.id}>
                    <TableCell>
                        <div className="flex items-center gap-3" title={fullAddress}>
                            <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage src={contact.avatar} alt="Avatar" />
                                <AvatarFallback>{contact.firstName ? contact.firstName.charAt(0) : 'X'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{`${contact.firstName} ${contact.lastName}`}</div>
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
                        {contact.mobilePhone && <div className="text-sm text-muted-foreground">Κιν: {contact.mobilePhone}</div>}
                        {contact.landlinePhone && <div className="text-sm text-muted-foreground">Σταθ: {contact.landlinePhone}</div>}
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
                            <EditContactDialog contact={contact} customLists={customLists} customListItems={customListItems}>
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
                )
            })}
            </TableBody>
        </Table>
        </div>
    ) : (
        <div className="flex flex-col col-span-full items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-4 min-h-[400px]">
            <BookUser className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold tracking-tight">Δεν βρέθηκαν επαφές</h3>
            <p className="text-sm text-muted-foreground mt-2">Δοκιμάστε έναν διαφορετικό όρο αναζήτησης.</p>
        </div>
    )}
    </>
  );
}
