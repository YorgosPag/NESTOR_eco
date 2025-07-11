
"use client";

import { useState } from 'react';
import type { CustomListItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditItemForm } from './edit-item-form';

interface EditItemDialogProps {
    item: CustomListItem;
    children: React.ReactNode;
}

export function EditItemDialog({ item, children }: EditItemDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Αντικειμένου</DialogTitle>
          <DialogDescription>Ενημερώστε το όνομα του αντικειμένου.</DialogDescription>
        </DialogHeader>
        <EditItemForm item={item} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
