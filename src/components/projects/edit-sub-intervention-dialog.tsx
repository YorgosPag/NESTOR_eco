
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
import { EditSubInterventionForm } from './edit-sub-intervention-form';
import type { SubIntervention, CustomList, CustomListItem } from '@/types';
import { ScrollArea } from '../ui/scroll-area';

interface EditSubInterventionDialogProps {
    interventionMasterId: string;
    interventionCategory: string;
    projectId: string;
    subIntervention: SubIntervention;
    children: ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function EditSubInterventionDialog({ interventionMasterId, interventionCategory, projectId, subIntervention, children, customLists, customListItems }: EditSubInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Υπο-Παρέμβασης</DialogTitle>
          <DialogDescription>
            Επεξεργασία ανάλυσης κόστους για: <strong>{interventionCategory}</strong>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
        <EditSubInterventionForm 
            key={subIntervention.id}
            interventionMasterId={interventionMasterId} 
            projectId={projectId} 
            subIntervention={subIntervention}
            setOpen={setOpen} 
            customLists={customLists}
            customListItems={customListItems}
        />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
