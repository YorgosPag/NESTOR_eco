
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
import { CreateCategoryForm } from './create-category-form';

export function CreateCategoryDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Δημιουργία Νέας Κατηγορίας</DialogTitle>
          <DialogDescription>Συμπληρώστε το όνομα της νέας κατηγορίας.</DialogDescription>
        </DialogHeader>
        <CreateCategoryForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
