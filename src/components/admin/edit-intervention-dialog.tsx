
"use client";

import { useState } from 'react';
import type { MasterIntervention, CustomList, CustomListItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditInterventionForm } from './edit-intervention-form';

interface EditInterventionDialogProps {
    intervention: MasterIntervention;
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function EditInterventionDialog({ intervention, children, customLists, customListItems }: EditInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Master Παρέμβασης</DialogTitle>
          <DialogDescription>Ενημερώστε τα στοιχεία της παρέμβασης. Αυτές οι αλλαγές θα εφαρμοστούν σε όλες τις μελλοντικές προσθήκες στα έργα.</DialogDescription>
        </DialogHeader>
        <EditInterventionForm intervention={intervention} setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
      </DialogContent>
    </Dialog>
  );
}
