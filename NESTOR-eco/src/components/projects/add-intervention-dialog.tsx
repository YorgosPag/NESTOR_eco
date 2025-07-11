
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
import type { MasterIntervention } from '@/types';

export function AddInterventionDialog({ projectId, masterInterventions, children }: { projectId: string; masterInterventions: MasterIntervention[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Προσθήκη Νέας Παρέμβασης</DialogTitle>
          <DialogDescription>Επιλέξτε μια παρέμβαση από τη λίστα, συμπληρώστε τα στοιχεία και προσθέστε την στο έργο.</DialogDescription>
        </DialogHeader>
        <AddInterventionForm projectId={projectId} masterInterventions={masterInterventions} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
