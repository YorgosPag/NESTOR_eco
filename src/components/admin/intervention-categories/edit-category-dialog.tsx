
"use client";

import { useState } from 'react';
import type { ManagedInterventionCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditCategoryForm } from './edit-category-form';

interface EditCategoryDialogProps {
    category: ManagedInterventionCategory;
    children: React.ReactNode;
}

export function EditCategoryDialog({ category, children }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Κατηγορίας</DialogTitle>
          <DialogDescription>Ενημερώστε το όνομα της κατηγορίας.</DialogDescription>
        </DialogHeader>
        <EditCategoryForm category={category} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
