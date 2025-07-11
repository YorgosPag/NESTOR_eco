
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
import { AddInterventionForm } from './add-intervention-form';
import type { CustomList, CustomListItem } from '@/types';

interface AddInterventionDialogProps {
    projectId: string;
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function AddInterventionDialog({ projectId, children, customLists, customListItems }: AddInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Προσθήκη Νέας Παρέμβασης</DialogTitle>
          <DialogDescription>Επιλέξτε το όνομα για τη νέα παρέμβαση.</DialogDescription>
        </DialogHeader>
        <AddInterventionForm projectId={projectId} setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
      </DialogContent>
    </Dialog>
  );
}
