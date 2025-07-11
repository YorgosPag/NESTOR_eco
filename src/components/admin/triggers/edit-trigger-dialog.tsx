"use client";

import { useState } from 'react';
import type { Trigger, CustomList, CustomListItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditTriggerForm } from './edit-trigger-form';

interface EditTriggerDialogProps {
    trigger: Trigger;
    children: React.ReactNode;
    customLists: CustomList[];
    customListItems: CustomListItem[];
}

export function EditTriggerDialog({ trigger, children, customLists, customListItems }: EditTriggerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Trigger</DialogTitle>
          <DialogDescription>Ενημερώστε τα στοιχεία του trigger.</DialogDescription>
        </DialogHeader>
        <EditTriggerForm trigger={trigger} setOpen={setOpen} customLists={customLists} customListItems={customListItems} />
      </DialogContent>
    </Dialog>
  );
}
