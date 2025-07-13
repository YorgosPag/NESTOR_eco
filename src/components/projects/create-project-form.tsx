
"use client";

import { useActionState, useFormStatus } from 'react-dom';
import { createProjectAction } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Contact } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const initialState = {
  message: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Δημιουργία...' : 'Δημιουργία Έργου'}
    </Button>
  );
}

export function CreateProjectForm({ contacts }: { contacts: Contact[] }) {
  const [state, formAction] = useActionState(createProjectAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && state.errors) {
      toast({
        variant: "destructive",
        title: "Σφάλμα Επικύρωσης",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Τίτλος Έργου</Label>
        <Input id="title" name="title" placeholder="π.χ., Ανακαίνιση κατοικίας Παπαδόπουλου" required aria-describedby="title-error" />
        <div id="title-error" aria-live="polite" aria-atomic="true">
          {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="applicationNumber">Αριθμός Αίτησης (Προαιρετικό)</Label>
        <Input id="applicationNumber" name="applicationNumber" placeholder="π.χ., ΕΞ-2024-123" aria-describedby="applicationNumber-error" />
        <div id="applicationNumber-error" aria-live="polite" aria-atomic="true">
          {state.errors?.applicationNumber && <p className="text-sm font-medium text-destructive">{state.errors.applicationNumber[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ownerContactId">Ιδιοκτήτης / Ωφελούμενος</Label>
        <Select name="ownerContactId" required>
            <SelectTrigger id="ownerContactId" aria-describedby="ownerContactId-error">
                <SelectValue placeholder="Επιλέξτε από τη λίστα επαφών..." />
            </SelectTrigger>
            <SelectContent>
                {contacts.filter(c => c.role === 'Πελάτης').map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <div id="ownerContactId-error" aria-live="polite" aria-atomic="true">
            {state.errors?.ownerContactId && <p className="text-sm font-medium text-destructive">{state.errors.ownerContactId[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="deadline">Προθεσμία Ολοκλήρωσης Έργου (Προαιρετικό)</Label>
        <Input id="deadline" name="deadline" type="date" aria-describedby="deadline-error" />
         <div id="deadline-error" aria-live="polite" aria-atomic="true">
          {state.errors?.deadline && <p className="text-sm font-medium text-destructive">{state.errors.deadline[0]}</p>}
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
