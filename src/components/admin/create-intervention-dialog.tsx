
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
import { CreateInterventionForm } from './create-intervention-form';
import type { CustomList, CustomListItem } from '@/types';

interface CreateInterventionDialogProps {
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function CreateInterventionDialog({ children, customLists, customListItems }: CreateInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Master Παρέμβασης</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία της νέας παρέμβασης που θα είναι διαθέσιμη για προσθήκη στα έργα.</DialogDescription>
        </DialogHeader>
        <CreateInterventionForm setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
      </DialogContent>
    </Dialog>
  );
}
