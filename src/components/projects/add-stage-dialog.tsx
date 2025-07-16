

"use client";

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddStageForm } from './add-stage-form';
import type { Contact } from '@/types';

interface AddStageDialogProps {
    interventionMasterId: string;
    projectId: string;
    contacts: Contact[];
    children: ReactNode;
}

export function AddStageDialog({ interventionMasterId, projectId, contacts, children }: AddStageDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md" autoFocusSelector="#title">
        <DialogHeader>
          <DialogTitle>Προσθήκη Νέου Σταδίου</DialogTitle>
          <DialogDescription>
            Συμπληρώστε τις λεπτομέρειες του νέου σταδίου.
          </DialogDescription>
        </DialogHeader>
        <AddStageForm interventionMasterId={interventionMasterId} projectId={projectId} contacts={contacts} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
