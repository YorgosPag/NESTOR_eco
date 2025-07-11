
"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createCustomListItemAction } from '@/app/actions/admin';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Προσθήκη"}
    </Button>
  );
}

export function CreateItemForm({ setOpen, listId }: { setOpen: (open: boolean) => void, listId: string }) {
    const [state, formAction] = useFormState(createCustomListItemAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success === true && state.message) {
            toast({ title: 'Αποτέλεσμα Προσθήκης', description: state.message });
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
            <input type="hidden" name="listId" value={listId} />
            <div className="space-y-2">
                <Label htmlFor="name">Ονόματα Αντικειμένων</Label>
                <Textarea 
                    id="name" 
                    name="name" 
                    placeholder="π.χ., Daikin;Mitsubishi;LG" 
                    required 
                    rows={5}
                />
                <p className="text-xs text-muted-foreground">
                    Διαχωρίστε πολλαπλά αντικείμενα με ερωτηματικό (;).
                </p>
                {state.errors?.name && <p className="text-sm font-medium text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}
