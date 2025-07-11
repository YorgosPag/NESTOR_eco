
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
import type { Project, ProjectIntervention, MasterIntervention } from '@/types';

interface EditInterventionDialogProps {
    project: Project;
    intervention: ProjectIntervention;
    masterInterventions: MasterIntervention[];
    children: React.ReactNode;
}

export function EditInterventionDialog({ project, intervention, masterInterventions, children }: EditInterventionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Παρέμβασης</DialogTitle>
          <DialogDescription>Ενημερώστε τα στοιχεία της παρέμβασης. Το συνολικό κόστος θα υπολογιστεί αυτόματα.</DialogDescription>
        </DialogHeader>
        <EditInterventionForm project={project} intervention={intervention} masterInterventions={masterInterventions} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
