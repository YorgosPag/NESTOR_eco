
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

export function CreateInterventionDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Master Παρέμβασης</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία της νέας παρέμβασης που θα είναι διαθέσιμη για προσθήκη στα έργα.</DialogDescription>
        </DialogHeader>
        <CreateInterventionForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
