
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOfferForm } from './create-offer-form';
import type { Project, Contact, Offer, CustomList, CustomListItem } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateOfferDialogProps {
    children: React.ReactNode;
    contacts: Contact[];
    projects: Project[];
    onAddOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function CreateOfferDialog({ children, contacts, projects, onAddOffer, customLists, customListItems }: CreateOfferDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Καταχώριση Νέας Προσφοράς</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία της προσφοράς.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <CreateOfferForm 
                setOpen={setOpen} 
                contacts={contacts} 
                projects={projects} 
                onAddOffer={onAddOffer}
                customLists={customLists}
                customListItems={customListItems}
            />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
