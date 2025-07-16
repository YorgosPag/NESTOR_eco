
"use client";

import { useEffect, useState, useTransition } from "react";
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
import { MoreHorizontal, Pencil, Trash2, Search, BookUser, Loader2 } from "lucide-react";
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
import { getPaginatedContacts } from "@/app/actions/contacts";
import { CreateContactDialog } from "./create-contact-dialog";
import { PlusCircle } from "lucide-react";

interface ContactsTableProps {
  customLists: CustomList[];
  customListItems: CustomListItem[];
}

const PAGE_SIZE = 10;

export function ContactsTable({ customLists, customListItems }: ContactsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [data, setData] = useState<{ contacts: Contact[], totalCount: number }>({ contacts: [], totalCount: 0 });
    const [page, setPage] = useState(1);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        startTransition(async () => {
            const result = await getPaginatedContacts({ page, limit: PAGE_SIZE, searchTerm: debouncedSearchTerm });
            setData(result);
        });
    }, [page, debouncedSearchTerm]);
    
    const totalPages = Math.ceil(data.totalCount / PAGE_SIZE);

  return (
    <>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-h1 flex items-center gap-2">
                    <BookUser className="h-6 w-6" />
                    Λίστα Επαφών
                </h1>
                <p className="text-muted">Διαχειριστείτε όλες τις επαφές σας από ένα κεντρικό σημείο.</p>
            </div>
            <CreateContactDialog customLists={customLists} customListItems={customListItems}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Νέα Επαφή
                </Button>
            </CreateContactDialog>
        </div>
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
            {isPending ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
            ) : data.contacts.length > 0 ? (
                data.contacts.map((contact) => {
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
                                    <DropdownMenuItem onSelectPreventClose>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Επεξεργασία
                                    </DropdownMenuItem>
                                </EditContactDialog>
                                <DeleteContactDialog contact={contact}>
                                    <DropdownMenuItem onSelectPreventClose className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Διαγραφή
                                    </DropdownMenuItem>
                                </DeleteContactDialog>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    )
                })
            ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       Δεν βρέθηκαν επαφές.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
         <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                Σελίδα {page} από {totalPages > 0 ? totalPages : 1}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1 || isPending}
            >
                Προηγούμενη
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || isPending}
            >
                Επόμενη
            </Button>
        </div>
    </>
  );
}
