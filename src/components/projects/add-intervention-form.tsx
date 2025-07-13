"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addInterventionAction } from '@/app/actions/interventions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { masterInterventionsData } from '@/lib/mock-data';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full mt-4">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Προσθήκη Παρέμβασης"}
    </Button>
  );
}

interface AddInterventionFormProps {
    projectId: string;
    setOpen: (open: boolean) => void;
}

export function AddInterventionForm({ projectId, setOpen }: AddInterventionFormProps) {
  const [state, formAction] = useFormState(addInterventionAction, initialState);
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
      <input type="hidden" name="projectId" value={projectId} />
      
      <div className="space-y-2">
          <Label htmlFor="interventionName">Όνομα Παρέμβασης</Label>
          <Input id="interventionName" name="interventionName" placeholder="π.χ. Τοποθέτηση Ηλιακού" required />
          {state.errors?.interventionName && <p className="text-sm font-medium text-destructive mt-1">{state.errors.interventionName[0]}</p>}
      </div>
      
      <SubmitButton />
    </form>
  );
}
