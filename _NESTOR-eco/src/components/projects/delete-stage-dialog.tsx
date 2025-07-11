
"use client";

import { useEffect, useState, type ReactNode, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { deleteStageAction } from '@/app/actions';
import type { Stage } from '@/types';

const initialState = {
  message: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ναι, Επιβεβαίωση Διαγραφής"}
        </Button>
    </AlertDialogAction>
  );
}

interface DeleteStageDialogProps {
  stage: Stage;
  projectId: string;
  children: ReactNode;
}

export function DeleteStageDialog({ stage, projectId, children }: DeleteStageDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteStageAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return; // Only show toasts if the dialog was open
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
  
  const descriptionText = stage.status === 'in progress'
    ? `Η διαγραφή του σταδίου "${stage.title}" είναι μη αναστρέψιμη και μπορεί να επηρεάσει τη ροή του έργου. Είστε βέβαιος ότι θέλετε να συνεχίσετε;`
    : `Είστε βέβαιος ότι θέλετε να διαγράψετε οριστικά το στάδιο "${stage.title}"; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Επιβεβαίωση Διαγραφής Σταδίου</AlertDialogTitle>
          <AlertDialogDescription>
            {descriptionText}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="stageId" value={stage.id} />
            <AlertDialogFooter>
                <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                <SubmitButton />
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
