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
import { CreateTriggerForm } from './create-trigger-form';
import type { CustomList, CustomListItem } from '@/types';

interface CreateTriggerDialogProps {
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function CreateTriggerDialog({ children, customLists, customListItems }: CreateTriggerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέου Trigger</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία του νέου trigger.</DialogDescription>
        </DialogHeader>
        <CreateTriggerForm setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
      </DialogContent>
    </Dialog>
  );
}
