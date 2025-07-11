
"use client";

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteProjectAction } from '@/app/actions';
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
import type { Project } from '@/types';

const initialState = {
  message: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ναι, Διαγραφή Έργου"}
        </Button>
    </AlertDialogAction>
  );
}

interface DeleteProjectDialogProps {
  project: Project;
  children: React.ReactNode;
}

export function DeleteProjectDialog({ project, children }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteProjectAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // We only want to show toasts if the dialog was open
    // This prevents toasts from showing on page load
    if (!open) return;

    if (state?.success === true) {
      toast({ title: 'Επιτυχία!', description: state.message });
      setOpen(false);
    } else if (state?.success === false && state.message) {
      toast({
        variant: 'destructive',
        title: 'Σφάλμα',
        description: state.message,
      });
      setOpen(false);
    }
  }, [state, toast, open]);
  
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Επιβεβαίωση Οριστικής Διαγραφής</AlertDialogTitle>
          <AlertDialogDescription>
            Είστε βέβαιος ότι θέλετε να διαγράψετε οριστικά το έργο ‘{project.title}’; Αυτή η ενέργεια είναι μη αναστρέψιμη και θα διαγράψει όλες τις σχετικές παρεμβάσεις και στάδια.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
            <input type="hidden" name="id" value={project.id} />
            <AlertDialogFooter>
                <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                <SubmitButton />
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
