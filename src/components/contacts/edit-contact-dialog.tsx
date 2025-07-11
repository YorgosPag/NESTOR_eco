"use client";

import { useState } from 'react';
import type { Contact, CustomList, CustomListItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditContactForm } from './edit-contact-form';
import { ScrollArea } from '../ui/scroll-area';

interface EditContactDialogProps {
    contact: Contact;
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function EditContactDialog({ contact, children, customLists, customListItems }: EditContactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Επαφής</DialogTitle>
          <DialogDescription>Ενημερώστε τα στοιχεία της επαφής.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <EditContactForm contact={contact} setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
