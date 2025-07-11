
"use client";

import { useState } from 'react';
import type { Project, Contact } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProjectForm } from './edit-project-form';

interface EditProjectDialogProps {
    project: Project;
    contacts: Contact[];
    children: React.ReactNode;
}

export function EditProjectDialog({ project, contacts, children }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Έργου</DialogTitle>
          <DialogDescription>Ενημερώστε τα βασικά στοιχεία του έργου.</DialogDescription>
        </DialogHeader>
        <EditProjectForm project={project} contacts={contacts} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
