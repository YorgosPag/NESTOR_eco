
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
import { CreateListForm } from './create-list-form';

export function CreateListDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Λίστας</DialogTitle>
          <DialogDescription>Δώστε ένα όνομα για τη νέα λίστα που θέλετε να δημιουργήσετε.</DialogDescription>
        </DialogHeader>
        <CreateListForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
