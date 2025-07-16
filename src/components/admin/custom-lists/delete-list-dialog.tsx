
"use client";

import { useEffect, useState } from 'react';
import * as React from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { deleteCustomListAction } from '@/app/actions/custom-lists';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { CustomList } from '@/types';

type FormState = {
  message: string | null;
  success: boolean;
  errors: { usage?: string[] } | null;
};

const initialState: FormState = {
  message: null,
  success: false,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ναι, Διαγραφή"}
        </Button>
    </AlertDialogAction>
  );
}

interface DeleteListDialogProps {
  list: CustomList;
  children: React.ReactNode;
}

export function DeleteListDialog({ list, children }: DeleteListDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteCustomListAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    if (state?.success === true) {
      toast({ title: 'Επιτυχία!', description: state.message });
      setOpen(false);
    } else if (state?.success === false && state.message) {
      if (!state.errors?.usage) {
        toast({
          variant: 'destructive',
          title: 'Σφάλμα',
          description: state.message,
        });
        setOpen(false);
      }
    }
  }, [state, toast, open, setOpen]);
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const form = new FormData();
    }
    setOpen(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        {state.errors?.usage ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Δεν Είναι Δυνατή η Διαγραφή</AlertDialogTitle>
              <AlertDialogDescription>
                {state.message} Χρησιμοποιείται στα παρακάτω σημεία και δεν μπορεί να διαγραφεί:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 max-h-60 overflow-y-auto rounded-md border bg-muted p-4 text-sm">
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {state.errors.usage.map((detail, index) => <li key={index}>{detail}</li>)}
              </ul>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Κατάλαβα</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Επιβεβαίωση Διαγραφής Λίστας</AlertDialogTitle>
              <AlertDialogDescription>
                Είστε βέβαιος ότι θέλετε να διαγράψετε τη λίστα ‘{list.name}’; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί και θα διαγράψει και όλα τα αντικείμενα που περιέχει.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={list.id} />
                <AlertDialogFooter>
                    <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                    <SubmitButton />
                </AlertDialogFooter>
            </form>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
