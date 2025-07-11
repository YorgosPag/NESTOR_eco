
"use client";

import type { Offer, Contact, Project } from "@/types";
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
import { MoreHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

interface OffersTableProps {
  offers: Offer[];
  contacts: Contact[];
  projects: Project[];
}

export function OffersTable({ offers, contacts, projects }: OffersTableProps) {
    if (offers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8 mt-4 min-h-[400px]">
                <h3 className="text-h2">Δεν υπάρχουν προσφορές</h3>
                <p className="text-muted mt-2">Πατήστε "Νέα Προσφορά" για να καταχωρήσετε την πρώτη σας.</p>
            </div>
        );
    }
  
    return (
    <div className="rounded-lg border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Προμηθευτής / Συνεργείο</TableHead>
                    <TableHead>Τύπος</TableHead>
                    <TableHead>Συνδεδεμένο Έργο</TableHead>
                    <TableHead>Ημ/νία Καταχώρισης</TableHead>
                    <TableHead>Αρχείο</TableHead>
                    <TableHead><span className="sr-only">Ενέργειες</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {offers.map((offer) => {
                    const supplier = contacts.find(c => c.id === offer.supplierId);
                    const project = offer.projectId ? projects.find(p => p.id === offer.projectId) : null;
                    return (
                        <TableRow key={offer.id}>
                            <TableCell className="font-medium">
                                {supplier ? `${supplier.firstName} ${supplier.lastName}` : 'Άγνωστος'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={offer.type === 'general' ? 'secondary' : 'default'}>
                                    {offer.type === 'general' ? 'Γενική' : 'Ανά Έργο'}
                                </Badge>
                            </TableCell>
                            <TableCell>{project ? project.title : '-'}</TableCell>
                            <TableCell>{format(new Date(offer.createdAt), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                                {offer.fileUrl ? (
                                    <Button asChild variant="outline" size="icon">
                                        <a href={offer.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <FileText className="h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : '-'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Μενού</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Επεξεργασία</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Διαγραφή</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    </div>
  );
}
