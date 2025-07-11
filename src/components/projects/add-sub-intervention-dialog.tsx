
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
import { AddSubInterventionForm } from './add-sub-intervention-form';
import type { CustomList, CustomListItem } from '@/types';
import { ScrollArea } from '../ui/scroll-area';

interface AddSubInterventionDialogProps {
    interventionMasterId: string;
    interventionCategory: string;
    projectId: string;
    children: ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function AddSubInterventionDialog({ interventionMasterId, interventionCategory, projectId, children, customLists, customListItems }: AddSubInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Προσθήκη Υπο-Παρέμβασης</DialogTitle>
          <DialogDescription>
            Προσθήκη ανάλυσης κόστους για την παρέμβαση: <br/><strong>{interventionCategory}</strong>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
         <AddSubInterventionForm 
            interventionMasterId={interventionMasterId} 
            projectId={projectId} 
            setOpen={setOpen} 
            customLists={customLists}
            customListItems={customListItems}
        />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
