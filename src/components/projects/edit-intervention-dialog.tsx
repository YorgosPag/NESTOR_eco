
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
import { EditInterventionForm } from './edit-intervention-form';
import type { Project, ProjectIntervention, CustomList, CustomListItem } from '@/types';

interface EditInterventionDialogProps {
    project: Project;
    intervention: ProjectIntervention;
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function EditInterventionDialog({ project, intervention, children, customLists, customListItems }: EditInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Παρέμβασης</DialogTitle>
          <DialogDescription>Ενημερώστε το όνομα της παρέμβασης.</DialogDescription>
        </DialogHeader>
        <EditInterventionForm 
            project={project} 
            intervention={intervention} 
            setOpen={setOpen} 
            customLists={customLists} 
            customListItems={customListItems}
        />
      </DialogContent>
    </Dialog>
  );
}
