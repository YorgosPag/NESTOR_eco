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
import { CreateContactForm } from './create-contact-form';
import type { CustomList, CustomListItem } from '@/types';
import { ScrollArea } from '../ui/scroll-area';

interface CreateContactDialogProps {
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function CreateContactDialog({ children, customLists, customListItems }: CreateContactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Επαφής</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία της νέας επαφής.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <CreateContactForm setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
