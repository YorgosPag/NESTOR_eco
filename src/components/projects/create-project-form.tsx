
"use client";

import { useActionState, useFormStatus } from 'react';
import { createProjectAction } from '@/app/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Contact } from '@/types';
import { CreateContactDialog } from '@/components/contacts/create-contact-dialog';
import { Separator } from '../ui/separator';
import { SearchableSelect } from '../ui/searchable-select';

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
  const [ownerContactId, setOwnerContactId] = useState('');


  useEffect(() => {
    if (state?.message && state.errors) {
      toast({
        variant: "destructive",
        title: "Σφάλμα Επικύρωσης",
        description: state.message,
      });
    }
  }, [state, toast]);

  const contactOptions = contacts
    .filter(c => c.role === 'Πελάτης')
    .map(contact => ({
        value: contact.id,
        label: `${contact.firstName} ${contact.lastName} (${contact.address || "Χωρίς διεύθυνση"})`
    })).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="ownerContactId" value={ownerContactId} />
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
        <Label htmlFor="ownerContactId-select">Ιδιοκτήτης / Ωφελούμενος</Label>
         <SearchableSelect
            value={ownerContactId}
            onValueChange={setOwnerContactId}
            options={contactOptions}
            placeholder="Επιλέξτε από τη λίστα επαφών..."
            searchPlaceholder="Αναζήτηση επαφής..."
            emptyMessage="Δεν βρέθηκε επαφή."
         >
            <Separator className="my-1"/>
            <CreateContactDialog customLists={[]} customListItems={[]}>
              <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Δημιουργία Νέας Επαφής</span>
              </div>
            </CreateContactDialog>
         </SearchableSelect>
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
