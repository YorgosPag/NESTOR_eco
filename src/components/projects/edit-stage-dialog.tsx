
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
import { EditStageForm } from './edit-stage-form';
import type { Stage, Contact } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface EditStageDialogProps {
    stage: Stage;
    projectId: string;
    contacts: Contact[];
    children: ReactNode;
}

export function EditStageDialog({ stage, projectId, contacts, children }: EditStageDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Σταδίου</DialogTitle>
          <DialogDescription>
             Ενημερώστε τις λεπτομέρειες του σταδίου.
          </DialogDescription>
        </DialogHeader>
        {stage.status === 'in progress' && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Προειδοποίηση</AlertTitle>
                <AlertDescription>
                    Αυτό το στάδιο βρίσκεται σε εξέλιξη. Οι αλλαγές μπορεί να επηρεάσουν τη ροή του έργου.
                </AlertDescription>
            </Alert>
        )}
        <EditStageForm stage={stage} projectId={projectId} contacts={contacts} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
