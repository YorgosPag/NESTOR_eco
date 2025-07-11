
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProjectAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import type { Project, Contact } from '@/types';
import { Separator } from '../ui/separator';
import { CreateContactDialog } from '../contacts/create-contact-dialog';

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Αποθήκευση Αλλαγών"}
    </Button>
  );
}

interface EditProjectFormProps {
    project: Project;
    contacts: Contact[];
    setOpen: (open: boolean) => void;
}

export function EditProjectForm({ project, contacts, setOpen }: EditProjectFormProps) {
    const [state, formAction] = useActionState(updateProjectAction, initialState);
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
    
    const formattedDeadline = project.deadline ? project.deadline.substring(0, 10) : '';

    return (
        <form action={formAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={project.id} />
             <div className="space-y-2">
                <Label htmlFor="title">Τίτλος Έργου</Label>
                <Input id="title" name="title" defaultValue={project.title} required />
                {state.errors?.title && <p className="text-sm font-medium text-destructive mt-1">{state.errors.title[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="ownerContactId">Ιδιοκτήτης / Ωφελούμενος</Label>
                <Select name="ownerContactId" defaultValue={project.ownerContactId} required>
                    <SelectTrigger id="ownerContactId">
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
                 {state.errors?.ownerContactId && <p className="text-sm font-medium text-destructive mt-1">{state.errors.ownerContactId[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="deadline">Προθεσμία Ολοκλήρωσης Έργου (Προαιρετικό)</Label>
                <Input id="deadline" name="deadline" type="date" defaultValue={formattedDeadline} />
                 {state.errors?.deadline && <p className="text-sm font-medium text-destructive mt-1">{state.errors.deadline[0]}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}
