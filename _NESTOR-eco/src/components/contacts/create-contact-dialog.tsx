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
import { CreateContactForm } from './create-contact-form';

export function CreateContactDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Επαφής</DialogTitle>
          <DialogDescription>Συμπληρώστε τα στοιχεία της νέας επαφής.</DialogDescription>
        </DialogHeader>
        <CreateContactForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
