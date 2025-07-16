
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
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
import { deleteSubInterventionAction } from '@/app/actions/sub-interventions';
import type { SubIntervention } from '@/types';

const initialState = {
  message: null,
  success: false,
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

interface DeleteSubInterventionDialogProps {
  projectId: string;
  interventionMasterId: string;
  subIntervention: SubIntervention;
  children: ReactNode;
}

export function DeleteSubInterventionDialog({ projectId, interventionMasterId, subIntervention, children }: DeleteSubInterventionDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(deleteSubInterventionAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!open && !state.message) return;

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
          <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
          <AlertDialogDescription>
            Είστε βέβαιος ότι θέλετε να διαγράψετε την υπο-παρέμβαση ‘{subIntervention.description}’; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="interventionMasterId" value={interventionMasterId} />
            <input type="hidden" name="subInterventionId" value={subIntervention.id} />
            <AlertDialogFooter>
                <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                <SubmitButton />
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
