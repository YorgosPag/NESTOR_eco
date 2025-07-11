
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
import { CreateItemForm } from './create-item-form';

export function CreateItemDialog({ children, listId }: { children: React.ReactNode, listId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Προσθήκη Αντικειμένων</DialogTitle>
          <DialogDescription>Συμπληρώστε ένα ή περισσότερα ονόματα, χωρισμένα με ερωτηματικό (;).</DialogDescription>
        </DialogHeader>
        <CreateItemForm setOpen={setOpen} listId={listId} />
      </DialogContent>
    </Dialog>
  );
}
