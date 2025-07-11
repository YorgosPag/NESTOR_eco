
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateContactAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Contact, ContactRole } from '@/types';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

const contactRoles: ContactRole[] = ["Προμηθευτής", "Τεχνίτης", "Πελάτης", "Λογιστήριο", "Συνεργείο", "Μηχανικός", "Άλλο"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

interface EditContactFormProps {
    contact: Contact;
    setOpen: (open: boolean) => void;
}

export function EditContactForm({ contact, setOpen }: EditContactFormProps) {
    const [state, formAction] = useActionState(updateContactAction, initialState);
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
            <input type="hidden" name="id" value={contact.id} />
            <div className="space-y-2">
                <Label htmlFor="name">Όνομα/Επώνυμο</Label>
                <Input id="name" name="name" defaultValue={contact.name} required />
                {state.errors?.name && <p className="text-sm font-medium text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={contact.email} required />
                {state.errors?.email && <p className="text-sm font-medium text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Τηλέφωνο (Προαιρετικό)</Label>
                <Input id="phone" name="phone" defaultValue={contact.phone} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Διεύθυνση (Προαιρετικό)</Label>
                <Input id="address" name="address" defaultValue={contact.address} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Ρόλος</Label>
                <Select name="role" defaultValue={contact.role} required>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Επιλέξτε ρόλο..." />
                    </SelectTrigger>
                    <SelectContent>
                        {contactRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                </Select>
                 {state.errors?.role && <p className="text-sm font-medium text-destructive mt-1">{state.errors.role[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="specialty">Επάγγελμα/Ειδικότητα (Προαιρετικό)</Label>
                <Input id="specialty" name="specialty" defaultValue={contact.specialty} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="company">Επιχείρηση/Οργανισμός (Προαιρετικό)</Label>
                <Input id="company" name="company" defaultValue={contact.company} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="avatar">URL Avatar (Προαιρετικό)</Label>
                <Input id="avatar" name="avatar" defaultValue={contact.avatar || ''} placeholder="https://example.com/avatar.png" />
                {state.errors?.avatar && <p className="text-sm font-medium text-destructive mt-1">{state.errors.avatar[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Σημειώσεις (Προαιρετικό)</Label>
                <Textarea id="notes" name="notes" defaultValue={contact.notes || ''} rows={3} />
            </div>
            <SubmitButton />
        </form>
    );
}
