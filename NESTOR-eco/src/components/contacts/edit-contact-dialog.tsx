"use client";

import { useState } from 'react';
import type { Contact } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditContactForm } from './edit-contact-form';

interface EditContactDialogProps {
    contact: Contact;
    children: React.ReactNode;
}

export function EditContactDialog({ contact, children }: EditContactDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Επαφής</DialogTitle>
          <DialogDescription>Ενημερώστε τα στοιχεία της επαφής.</DialogDescription>
        </DialogHeader>
        <EditContactForm contact={contact} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
