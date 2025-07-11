
"use client";

import { useFormStatus } from 'react-dom';
import { createProjectAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Contact } from '@/types';
import { CreateContactDialog } from '@/components/contacts/create-contact-dialog';
import { Separator } from '../ui/separator';

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
        <Label htmlFor="ownerContactId">Ιδιοκτήτης / Ωφελούμενος</Label>
        <Select name="ownerContactId" required>
            <SelectTrigger id="ownerContactId" aria-describedby="ownerContactId-error">
                <SelectValue placeholder="Επιλέξτε από τη λίστα επαφών..." />
            </SelectTrigger>
            <SelectContent>
                {contacts.filter(c => c.role === 'Πελάτης').map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.address || "Χωρίς διεύθυνση"})
                    </SelectItem>
                ))}
                <Separator className="my-1"/>
                <CreateContactDialog>
                  <div onMouseDown={(e) => e.preventDefault()} className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      <PlusCircle />
                      <span>Δημιουργία Νέας Επαφής</span>
                  </div>
                </CreateContactDialog>
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
