
"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateInterventionCategoryAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ManagedInterventionCategory } from '@/types';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση"}
    </Button>
  );
}

interface EditCategoryFormProps {
    category: ManagedInterventionCategory;
    setOpen: (open: boolean) => void;
}

export function EditCategoryForm({ category, setOpen }: EditCategoryFormProps) {
    const [state, formAction] = useFormState(updateInterventionCategoryAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success === true) {
            toast({ title: 'Επιτυχία!', description: state.message });
            setOpen(false);
        } else if (state?.success === false && state.message) {
            const errorMessages = state.errors ? Object.values(state.errors).flat().join('\n') : '';
            toast({
                variant: 'destructive',
                title: 'Σφάλμα',
                description: `${state.message}\n${errorMessages}`,
            });
        }
    }, [state, toast, setOpen]);

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={category.id} />
            <div className="space-y-2">
                <Label htmlFor="name">Όνομα Κατηγορίας</Label>
                <Input id="name" name="name" defaultValue={category.name} required />
                {state.errors?.name && <p className="text-sm font-medium text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}
